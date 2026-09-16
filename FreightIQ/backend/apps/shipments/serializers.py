from datetime import date
from rest_framework import serializers
from apps.shipments.models import Shipment, ShipmentItem
from apps.masterdata.models import Port, Airport
from calc.weight import actual_weight, volumetric_weight, chargeable_weight, total_volume_cbm
from calc.distance import haversine_distance, road_distance, main_leg_distance
from calc.transit import estimate_transit
from calc.pricing_stub import compute_indicative_total
from core.enums import TransportMode, Incoterm


class ShipmentItemSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)

    class Meta:
        model = ShipmentItem
        fields = [
            'id', 'package_type', 'commodity_description', 'hs_code',
            'quantity', 'weight_per_unit_kg', 'length_cm', 'width_cm', 'height_cm', 'is_stackable'
        ]

    def validate_commodity_description(self, value):
        v = (value or '').strip()
        if len(v) < 3:
            raise serializers.ValidationError("Commodity description must be at least 3 characters.")
        if v.lower() in ('general cargo', 'cargo', 'goods', 'misc', 'miscellaneous'):
            raise serializers.ValidationError("Vague commodity description rejected. Please provide a descriptive name for customs.")
        return v


class ShipmentSerializer(serializers.ModelSerializer):
    items = ShipmentItemSerializer(many=True, required=False)

    class Meta:
        model = Shipment
        fields = '__all__'
        read_only_fields = [
            'id', 'reference', 'created_by', 'gross_weight_kg',
            'volumetric_weight_kg', 'chargeable_units', 'chargeable_basis',
            'total_volume_cbm', 'created_at', 'updated_at'
        ]

    def validate(self, attrs):
        mode = attrs.get('mode', TransportMode.OCEAN)
        incoterm = attrs.get('incoterm', Incoterm.FOB)
        ready_date = attrs.get('ready_date')
        req_delivery_date = attrs.get('required_delivery_date')

        # Date validation
        if ready_date and ready_date < date.today():
            raise serializers.ValidationError({"ready_date": "Ready date cannot be in the past."})

        if ready_date and req_delivery_date and req_delivery_date <= ready_date:
            raise serializers.ValidationError({"required_delivery_date": "Required delivery date must be strictly after ready date."})

        # Origin / Destination gateways
        orig_code = attrs.get('origin_code') or (attrs.get('origin_port').un_locode if attrs.get('origin_port') else None)
        dest_code = attrs.get('destination_code') or (attrs.get('destination_port').un_locode if attrs.get('destination_port') else None)

        if orig_code and dest_code and orig_code == dest_code:
            raise serializers.ValidationError({"destination_code": "Destination gateway must differ from origin gateway."})

        # Conditional address validation based on Incoterm
        if incoterm in (Incoterm.EXW, Incoterm.FCA, Incoterm.DAP, Incoterm.DDP):
            if not attrs.get('pickup_address'):
                raise serializers.ValidationError({"pickup_address": f"Pickup address is mandatory under Incoterm {incoterm}."})

        if incoterm in (Incoterm.DAP, Incoterm.DDP):
            if not attrs.get('delivery_address'):
                raise serializers.ValidationError({"delivery_address": f"Delivery address is mandatory under Incoterm {incoterm}."})

        # Hazmat validation
        if attrs.get('is_hazardous'):
            if not attrs.get('un_number'):
                raise serializers.ValidationError({"un_number": "UN Number (UN0000-UN3999) is required for hazardous shipments."})
            if not attrs.get('imo_class'):
                raise serializers.ValidationError({"imo_class": "IMO Class (Classes 1-9) is required for hazardous shipments."})

        # Temperature controlled validation
        if attrs.get('is_temperature_controlled'):
            t_min = attrs.get('temp_min_c')
            t_max = attrs.get('temp_max_c')
            if t_min is None or t_max is None:
                raise serializers.ValidationError({"temp_min_c": "Temperature range (min & max °C) is required for temperature-controlled cargo."})
            if t_min >= t_max:
                raise serializers.ValidationError({"temp_max_c": "Maximum temperature must be strictly greater than minimum temperature."})

        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        user = self.context['request'].user if 'request' in self.context and self.context['request'].user.is_authenticated else None

        # Resolve gateway names and codes if Port/Airport objects are provided
        if validated_data.get('origin_port'):
            p = validated_data['origin_port']
            validated_data['origin_code'] = p.un_locode
            validated_data['origin_name'] = p.name
        elif validated_data.get('origin_airport'):
            a = validated_data['origin_airport']
            validated_data['origin_code'] = a.iata_code
            validated_data['origin_name'] = a.name

        if validated_data.get('destination_port'):
            p = validated_data['destination_port']
            validated_data['destination_code'] = p.un_locode
            validated_data['destination_name'] = p.name
        elif validated_data.get('destination_airport'):
            a = validated_data['destination_airport']
            validated_data['destination_code'] = a.iata_code
            validated_data['destination_name'] = a.name

        # Calculate weight and volumetric values
        items_dicts = [
            {
                'quantity': item.get('quantity', 1),
                'weight_per_unit_kg': float(item.get('weight_per_unit_kg', 0)),
                'length_cm': float(item.get('length_cm', 0)),
                'width_cm': float(item.get('width_cm', 0)),
                'height_cm': float(item.get('height_cm', 0)),
            }
            for item in items_data
        ]

        mode = validated_data.get('mode', TransportMode.OCEAN)
        load_type = validated_data.get('load_type', 'FCL')
        cnt_count = validated_data.get('container_count', 1)
        cnt_type = validated_data.get('container_type', '40HC')

        act_kg = actual_weight(items_dicts)
        vol_kg = volumetric_weight(items_dicts, mode)
        cbm = total_volume_cbm(items_dicts)
        charge_res = chargeable_weight(
            items=items_dicts,
            mode=mode,
            load_type=load_type,
            package_type=items_data[0].get('package_type', 'CARTON') if items_data else 'CARTON',
            container_count=cnt_count,
            container_type=cnt_type
        )

        shipment = Shipment.objects.create(
            created_by=user,
            gross_weight_kg=act_kg,
            volumetric_weight_kg=vol_kg,
            total_volume_cbm=cbm,
            chargeable_units=charge_res.get('units', 1),
            chargeable_basis=charge_res.get('basis', 'PER_CONTAINER'),
            **validated_data
        )

        for item_data in items_data:
            ShipmentItem.objects.create(shipment=shipment, **item_data)

        return shipment


class LiveEstimateRequestSerializer(serializers.Serializer):
    origin_code = serializers.CharField(required=True)
    destination_code = serializers.CharField(required=True)
    mode = serializers.CharField(default='OCEAN')
    load_type = serializers.CharField(default='FCL')
    incoterm = serializers.CharField(default='FOB')
    container_type = serializers.CharField(default='40HC')
    container_count = serializers.IntegerField(default=1)
    ready_date = serializers.DateField(required=False)
    pickup_address = serializers.CharField(required=False, allow_blank=True)
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(child=serializers.DictField(), required=False, default=list)
