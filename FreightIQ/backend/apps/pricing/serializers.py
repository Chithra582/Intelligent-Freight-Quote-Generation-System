from rest_framework import serializers
from apps.pricing.models import RateCard, RateCardLine, Surcharge, RateHistory


class RateCardLineSerializer(serializers.ModelSerializer):
    origin_code = serializers.CharField(source='origin_port.un_locode', read_only=True)
    destination_code = serializers.CharField(source='destination_port.un_locode', read_only=True)

    class Meta:
        model = RateCardLine
        fields = '__all__'


class RateCardSerializer(serializers.ModelSerializer):
    lines = RateCardLineSerializer(many=True, read_only=True)
    carrier_name = serializers.CharField(source='carrier.name', read_only=True)
    carrier_code = serializers.CharField(source='carrier.code', read_only=True)

    class Meta:
        model = RateCard
        fields = '__all__'


class SurchargeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Surcharge
        fields = '__all__'


class RateHistorySerializer(serializers.ModelSerializer):
    carrier_code = serializers.CharField(source='carrier.code', read_only=True)

    class Meta:
        model = RateHistory
        fields = '__all__'


class RateCardImportSerializer(serializers.Serializer):
    carrier_code = serializers.CharField(required=True)
    name = serializers.CharField(required=True)
    rate_type = serializers.CharField(default='CONTRACT')
    valid_from = serializers.DateField(required=True)
    valid_to = serializers.DateField(required=True)
    lines = serializers.ListField(child=serializers.DictField(), required=True)
