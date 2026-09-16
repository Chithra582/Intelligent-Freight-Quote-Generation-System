from django.urls import path
from apps.masterdata.views import (
    PortListView, AirportListView, CarrierListView,
    CarrierServiceListView, ContainerTypeListView,
    CommodityListView, CurrencyListView
)

urlpatterns = [
    path('ports/', PortListView.as_view(), name='masterdata_ports'),
    path('airports/', AirportListView.as_view(), name='masterdata_airports'),
    path('carriers/', CarrierListView.as_view(), name='masterdata_carriers'),
    path('services/', CarrierServiceListView.as_view(), name='masterdata_services'),
    path('container-types/', ContainerTypeListView.as_view(), name='masterdata_container_types'),
    path('commodities/', CommodityListView.as_view(), name='masterdata_commodities'),
    path('currencies/', CurrencyListView.as_view(), name='masterdata_currencies'),
]
