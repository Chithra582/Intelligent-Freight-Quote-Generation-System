from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),

    # OpenAPI 3 Schema & Interactive Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API v1 Endpoints (Milestones 1 & 2)
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/masterdata/', include('apps.masterdata.urls')),
    path('api/v1/customers/', include('apps.customers.urls')),
    path('api/v1/shipments/', include('apps.shipments.urls')),
    path('api/v1/gateways/', include('apps.masterdata.gateway_urls')),
    path('api/v1/routes/', include('apps.routing.urls')),
    path('api/v1/pricing/', include('apps.pricing.urls')),
    path('api/v1/quotes/', include('apps.quotes.urls')),
    path('api/v1/multi-agent/', include('apps.multiagent.urls')),
    path('api/v1/mongodb/status/', __import__('apps.core.views', fromlist=['mongodb_status_view']).mongodb_status_view, name='mongodb-status'),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
