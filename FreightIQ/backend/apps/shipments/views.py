from datetime import date
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.shipments.models import Shipment
from apps.shipments.serializers import ShipmentSerializer, LiveEstimateRequestSerializer
from apps.masterdata.models import Port, Airport
from calc.weight import actual_weight, volumetric_weight, chargeable_weight, total_volume_cbm
from calc.distance import main_leg_distance
from calc.transit import estimate_transit
from calc.pricing_stub import compute_indicative_total
from core.enums import UserRole


class ShipmentListCreateView(generics.ListCreateAPIView):
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Shipment.objects.all().select_related(
            'customer', 'origin_port', 'destination_port', 'origin_airport', 'destination_airport'
        ).prefetch_related('items').order_by('-created_at')

        # Tenant isolation for Customer role
        if user.role == UserRole.CUSTOMER:
            if user.customer_id:
                qs = qs.filter(customer_id=user.customer_id)
            elif user.organization_id:
                qs = qs.filter(created_by__organization_id=user.organization_id)
            else:
                qs = qs.filter(created_by=user)

        # Filters
        mode = self.request.query_params.get('mode')
        if mode:
            qs = qs.filter(mode__iexact=mode)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status__iexact=status_param)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(reference__icontains=search)

        return qs


class ShipmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Shipment.objects.all().select_related(
            'customer', 'origin_port', 'destination_port'
        ).prefetch_related('items', 'routes')

        if user.role == UserRole.CUSTOMER:
            if user.customer_id:
                qs = qs.filter(customer_id=user.customer_id)
            elif user.organization_id:
                qs = qs.filter(created_by__organization_id=user.organization_id)
            else:
                qs = qs.filter(created_by=user)

        return qs


class LiveEstimateStatelessView(APIView):
    """
    Stateless endpoint for real-time frontend calculation verification.
    Computes distance, weights, transit time, and indicative quote instantly without persisting.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LiveEstimateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        orig_code = data['origin_code'].strip().upper()
        dest_code = data['destination_code'].strip().upper()
        mode = data.get('mode', 'OCEAN').upper()
        load_type = data.get('load_type', 'FCL').upper()
        items = data.get('items', [])
        container_type = data.get('container_type', '40HC')
        container_count = data.get('container_count', 1)
        ready_dt = data.get('ready_date', date.today())

        # Resolve gateway coordinates & regions
        orig_lat, orig_lon, orig_reg = 18.95, 72.95, 'APAC'
        dest_lat, dest_lon, dest_reg = 25.01, 55.06, 'MEASA'

        p_orig = Port.objects.filter(un_locode=orig_code).select_related('country').first()
        p_dest = Port.objects.filter(un_locode=dest_code).select_related('country').first()

        if p_orig:
            orig_lat, orig_lon = p_orig.latitude, p_orig.longitude
            orig_reg = p_orig.country.region
        else:
            a_orig = Airport.objects.filter(iata_code=orig_code).select_related('country').first()
            if a_orig:
                orig_lat, orig_lon = a_orig.latitude, a_orig.longitude
                orig_reg = a_orig.country.region

        if p_dest:
            dest_lat, dest_lon = p_dest.latitude, p_dest.longitude
            dest_reg = p_dest.country.region
        else:
            a_dest = Airport.objects.filter(iata_code=dest_code).select_related('country').first()
            if a_dest:
                dest_lat, dest_lon = a_dest.latitude, a_dest.longitude
                dest_reg = a_dest.country.region

        # 1. Distance
        main_dist, dist_unit = main_leg_distance(
            origin_lat=orig_lat, origin_lon=orig_lon, origin_code=orig_code,
            dest_lat=dest_lat, dest_lon=dest_lon, dest_code=dest_code,
            mode=mode
        )

        # 2. Weights & Chargeable basis
        items_dict = [
            {
                'quantity': item.get('quantity', 1),
                'weight_per_unit_kg': float(item.get('weight_per_unit_kg', item.get('weight_kg', 0))),
                'length_cm': float(item.get('length_cm', 0)),
                'width_cm': float(item.get('width_cm', 0)),
                'height_cm': float(item.get('height_cm', 0)),
            }
            for item in items
        ] if items else [{'quantity': container_count, 'weight_per_unit_kg': 20000}]

        act_kg = actual_weight(items_dict)
        vol_kg = volumetric_weight(items_dict, mode)
        cbm = total_volume_cbm(items_dict)
        charge_res = chargeable_weight(
            items=items_dict,
            mode=mode,
            load_type=load_type,
            package_type=items[0].get('package_type', 'CARTON') if items else 'CONTAINER',
            container_count=container_count,
            container_type=container_type
        )

        # 3. Transit Estimation
        transit_res = estimate_transit(
            main_leg_dist=main_dist,
            mode=mode,
            load_type=load_type,
            has_door_pickup=bool(data.get('pickup_address')),
            has_door_delivery=bool(data.get('delivery_address')),
            ready_date=ready_dt
        )

        # 4. Indicative Total
        indicative_price = compute_indicative_total(
            origin_region=orig_reg,
            dest_region=dest_reg,
            mode=mode,
            load_type=load_type,
            chargeable_info=charge_res,
            distance_val=main_dist,
            container_type=container_type
        )

        response_payload = {
            'success': True,
            'data': {
                'origin_code': orig_code,
                'destination_code': dest_code,
                'mode': mode,
                'distance': {
                    'value': main_dist,
                    'unit': dist_unit
                },
                'weights': {
                    'actual_weight_kg': act_kg,
                    'volumetric_weight_kg': vol_kg,
                    'volume_cbm': cbm,
                    'chargeable': charge_res
                },
                'transit': transit_res,
                'pricing': indicative_price,
                'is_indicative': True
            }
        }
        return Response(response_payload)
