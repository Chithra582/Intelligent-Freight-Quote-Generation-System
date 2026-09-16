from django.urls import path
from apps.shipments.views import ShipmentListCreateView, ShipmentDetailView, LiveEstimateStatelessView
from apps.routing.views import ShipmentRoutesGenerateView

urlpatterns = [
    path('', ShipmentListCreateView.as_view(), name='shipment_list_create'),
    path('estimate/', LiveEstimateStatelessView.as_view(), name='shipment_estimate'),
    path('<uuid:pk>/', ShipmentDetailView.as_view(), name='shipment_detail'),
    path('<uuid:pk>/routes/', ShipmentRoutesGenerateView.as_view(), name='shipment_routes_generate'),
]
