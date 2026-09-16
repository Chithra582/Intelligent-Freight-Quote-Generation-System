from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from apps.masterdata.models import (
    Country, Port, Airport, Carrier, CarrierService,
    ContainerType, Commodity, Currency, FxRate
)
from apps.masterdata.serializers import (
    CountrySerializer, PortSerializer, AirportSerializer,
    CarrierSerializer, CarrierServiceSerializer, ContainerTypeSerializer,
    CommoditySerializer, CurrencySerializer, FxRateSerializer,
    GatewaySearchResultSerializer
)


class GatewaySearchView(APIView):
    """
    Asynchronous searchable dropdown endpoint for ports, airports, and hubs.
    Matches by name, city, or code. Returns top 10 matches.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        mode = request.query_params.get('mode', 'OCEAN').strip().upper()

        results = []

        # If mode is OCEAN or not specified, search sea ports
        if mode in ('OCEAN', 'ALL', ''):
            ports_qs = Port.objects.filter(is_active=True).select_related('country')
            if query:
                ports_qs = ports_qs.filter(
                    Q(un_locode__icontains=query) |
                    Q(name__icontains=query) |
                    Q(city__icontains=query) |
                    Q(country__name__icontains=query)
                )
            for p in ports_qs[:10]:
                results.append({
                    'id': str(p.id),
                    'code': p.un_locode,
                    'name': p.name,
                    'city': p.city,
                    'country': p.country_id,
                    'country_name': p.country.name,
                    'type': 'PORT',
                    'latitude': p.latitude,
                    'longitude': p.longitude,
                    'supported_modes': p.supported_modes or ['OCEAN'],
                    'is_transhipment_hub': p.is_transhipment_hub
                })

        # If mode is AIR / EXPRESS_AIR, search airports
        if mode in ('AIR', 'EXPRESS_AIR', 'ALL'):
            airports_qs = Airport.objects.filter(is_active=True).select_related('country')
            if query:
                airports_qs = airports_qs.filter(
                    Q(iata_code__icontains=query) |
                    Q(name__icontains=query) |
                    Q(city__icontains=query) |
                    Q(country__name__icontains=query)
                )
            for a in airports_qs[:10]:
                results.append({
                    'id': str(a.id),
                    'code': a.iata_code,
                    'name': a.name,
                    'city': a.city,
                    'country': a.country_id,
                    'country_name': a.country.name,
                    'type': 'AIRPORT',
                    'latitude': a.latitude,
                    'longitude': a.longitude,
                    'supported_modes': ['AIR', 'EXPRESS_AIR'],
                    'is_transhipment_hub': False
                })

        # If mode is GROUND_RAIL, include ports with rail connectivity and major hub terminals
        if mode == 'GROUND_RAIL':
            rail_qs = Port.objects.filter(is_active=True).select_related('country')
            if query:
                rail_qs = rail_qs.filter(
                    Q(un_locode__icontains=query) |
                    Q(name__icontains=query) |
                    Q(city__icontains=query)
                )
            for r in rail_qs[:10]:
                results.append({
                    'id': str(r.id),
                    'code': r.un_locode,
                    'name': r.name,
                    'city': r.city,
                    'country': r.country_id,
                    'country_name': r.country.name,
                    'type': 'HUB',
                    'latitude': r.latitude,
                    'longitude': r.longitude,
                    'supported_modes': ['GROUND_RAIL'],
                    'is_transhipment_hub': r.is_transhipment_hub
                })

        serializer = GatewaySearchResultSerializer(results[:10], many=True)
        return Response({'success': True, 'data': serializer.data})


class ContainerTypeListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = ContainerType.objects.filter(is_active=True)
    serializer_class = ContainerTypeSerializer
    pagination_class = None


class PortListView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Port.objects.filter(is_active=True).select_related('country')
    serializer_class = PortSerializer


class AirportListView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Airport.objects.filter(is_active=True).select_related('country')
    serializer_class = AirportSerializer


class CarrierListView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Carrier.objects.filter(is_active=True)
    serializer_class = CarrierSerializer


class CarrierServiceListView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = CarrierService.objects.filter(is_active=True).select_related('carrier')
    serializer_class = CarrierServiceSerializer


class CommodityListView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Commodity.objects.filter(is_active=True)
    serializer_class = CommoditySerializer


class CurrencyListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Currency.objects.filter(is_active=True)
    serializer_class = CurrencySerializer
    pagination_class = None
