from django.urls import path
from apps.routing.views import RouteOptionsListView, RouteDetailView, RoutePerformanceListView

urlpatterns = [
    path('options/', RouteOptionsListView.as_view(), name='route_options'),
    path('performance/', RoutePerformanceListView.as_view(), name='route_performance'),
    path('<uuid:pk>/', RouteDetailView.as_view(), name='route_detail'),
]
