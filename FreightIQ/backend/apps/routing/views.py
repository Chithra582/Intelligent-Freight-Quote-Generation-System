from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.shipments.models import Shipment
from apps.masterdata.models import Port, Carrier
from apps.routing.models import Route, RouteLeg, PortCongestionSnapshot, RoutePerformance
from apps.routing.serializers import RouteSerializer, PortCongestionSnapshotSerializer, RoutePerformanceSerializer
from apps.routing.route_agent import RouteAgent
from core.enums import ShipmentStatus


class ShipmentRoutesGenerateView(APIView):
    """
    POST /api/v1/shipments/{id}/routes/
    Triggers the Route Agent, computes optimal routes, persists them, and updates shipment status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        shipment = get_object_or_404(Shipment, pk=pk)

        agent = RouteAgent()
        route_options = agent.find_routes(
            origin_code=shipment.origin_code,
            dest_code=shipment.destination_code,
            mode=shipment.mode,
            container_type=shipment.container_type,
            is_hazardous=shipment.is_hazardous,
            is_temperature_controlled=shipment.is_temperature_controlled,
            ready_date=shipment.ready_date,
            required_delivery_date=shipment.required_delivery_date
        )

        # Clear existing unquoted route options for this shipment
        Route.objects.filter(shipment=shipment).delete()

        created_routes = []
        p_orig = Port.objects.filter(un_locode=shipment.origin_code).first()
        p_dest = Port.objects.filter(un_locode=shipment.destination_code).first()

        for opt in route_options:
            carrier = Carrier.objects.filter(code=opt['carrier_code']).first()
            route_obj = Route.objects.create(
                shipment=shipment,
                route_name=opt['route_name'],
                origin_port=p_orig,
                destination_port=p_dest,
                carrier=carrier,
                transit_days=opt['transit_days'],
                distance_nm=opt['distance_nm'],
                congestion_score=round(opt['congestion_hours'] / 50.0, 3),
                composite_score=opt['composite_score'],
                is_recommended=opt['is_recommended'],
                rank=opt['rank'],
                estimated_cost=opt['estimated_cost'],
                sub_scores=opt['sub_scores'],
                rationale=opt['rationale']
            )

            # Persist legs
            for leg in opt.get('legs', []):
                leg_from = Port.objects.filter(un_locode=leg['from_code']).first()
                leg_to = Port.objects.filter(un_locode=leg['to_code']).first()
                leg_cr = Carrier.objects.filter(code=leg['carrier_code']).first()

                RouteLeg.objects.create(
                    route=route_obj,
                    leg_index=leg['leg_index'],
                    from_port=leg_from,
                    to_port=leg_to,
                    carrier=leg_cr,
                    vessel_name=leg['vessel_name'],
                    transit_days=leg['transit_days'],
                    is_transhipment=leg['is_transhipment']
                )

            created_routes.append(route_obj)

        shipment.status = ShipmentStatus.QUOTED
        shipment.save(update_fields=['status'])

        serializer = RouteSerializer(created_routes, many=True)
        return Response({
            'success': True,
            'shipment_id': str(shipment.id),
            'shipment_reference': shipment.reference,
            'route_count': len(created_routes),
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)


class RouteOptionsListView(generics.ListAPIView):
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        shipment_id = self.request.query_params.get('shipment_id')
        if shipment_id:
            return Route.objects.filter(shipment_id=shipment_id).select_related(
                'carrier', 'origin_port', 'destination_port'
            ).prefetch_related('legs')
        return Route.objects.all().select_related('carrier', 'origin_port', 'destination_port').prefetch_related('legs')


class RouteDetailView(generics.RetrieveAPIView):
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Route.objects.all().select_related('carrier', 'origin_port', 'destination_port').prefetch_related('legs')


class RoutePerformanceListView(generics.ListAPIView):
    serializer_class = RoutePerformanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        lane = self.request.query_params.get('lane')
        qs = RoutePerformance.objects.all().select_related('carrier')
        if lane:
            qs = qs.filter(lane_key__iexact=lane)
        return qs
