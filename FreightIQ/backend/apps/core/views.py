from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .mongodb import ping_mongodb, get_mongodb_db

@api_view(['GET'])
@permission_classes([AllowAny])
def mongodb_status_view(request):
    """
    Returns live MongoDB Atlas connection status, active collections, and health telemetry.
    """
    health = ping_mongodb()
    return Response({
        "success": health.get("status") == "connected",
        "mongodb_cluster": "cluster0.awyoltz.mongodb.net",
        "database_name": "freightiq",
        "health": health
    })
