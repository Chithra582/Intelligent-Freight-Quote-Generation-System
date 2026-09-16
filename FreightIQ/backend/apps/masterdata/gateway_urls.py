from django.urls import path
from apps.masterdata.views import GatewaySearchView

urlpatterns = [
    path('search/', GatewaySearchView.as_view(), name='gateway_search'),
]
