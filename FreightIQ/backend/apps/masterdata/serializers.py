from rest_framework import serializers
from apps.masterdata.models import (
    Country, Port, Airport, PortDistance, Carrier,
    CarrierService, ContainerType, Commodity, Currency, FxRate, BusinessCalendar
)


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'


class PortSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)

    class Meta:
        model = Port
        fields = '__all__'


class AirportSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)

    class Meta:
        model = Airport
        fields = '__all__'


class CarrierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrier
        fields = '__all__'


class CarrierServiceSerializer(serializers.ModelSerializer):
    carrier_name = serializers.CharField(source='carrier.name', read_only=True)
    carrier_code = serializers.CharField(source='carrier.code', read_only=True)

    class Meta:
        model = CarrierService
        fields = '__all__'


class ContainerTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContainerType
        fields = '__all__'


class CommoditySerializer(serializers.ModelSerializer):
    class Meta:
        model = Commodity
        fields = '__all__'


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = '__all__'


class FxRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FxRate
        fields = '__all__'


class GatewaySearchResultSerializer(serializers.Serializer):
    id = serializers.CharField()
    code = serializers.CharField()
    name = serializers.CharField()
    city = serializers.CharField()
    country = serializers.CharField()
    country_name = serializers.CharField()
    type = serializers.CharField()  # PORT or AIRPORT or HUB
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    supported_modes = serializers.ListField(child=serializers.CharField())
    is_transhipment_hub = serializers.BooleanField(default=False)
