from rest_framework import serializers
from apps.routing.models import Route, RouteLeg, PortCongestionSnapshot, RoutePerformance


class RouteLegSerializer(serializers.ModelSerializer):
    from_port_code = serializers.CharField(source='from_port.un_locode', read_only=True)
    to_port_code = serializers.CharField(source='to_port.un_locode', read_only=True)
    carrier_name = serializers.CharField(source='carrier.name', read_only=True)

    class Meta:
        model = RouteLeg
        fields = '__all__'


class RouteSerializer(serializers.ModelSerializer):
    legs = RouteLegSerializer(many=True, read_only=True)
    carrier_name = serializers.CharField(source='carrier.name', read_only=True)
    carrier_code = serializers.CharField(source='carrier.code', read_only=True)
    origin_code = serializers.CharField(source='origin_port.un_locode', read_only=True)
    destination_code = serializers.CharField(source='destination_port.un_locode', read_only=True)

    class Meta:
        model = Route
        fields = '__all__'


class PortCongestionSnapshotSerializer(serializers.ModelSerializer):
    port_code = serializers.CharField(source='port.un_locode', read_only=True)
    port_name = serializers.CharField(source='port.name', read_only=True)

    class Meta:
        model = PortCongestionSnapshot
        fields = '__all__'


class RoutePerformanceSerializer(serializers.ModelSerializer):
    carrier_name = serializers.CharField(source='carrier.name', read_only=True)
    carrier_code = serializers.CharField(source='carrier.code', read_only=True)

    class Meta:
        model = RoutePerformance
        fields = '__all__'
