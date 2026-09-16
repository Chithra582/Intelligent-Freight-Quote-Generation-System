from rest_framework import generics, permissions
from apps.customers.models import Customer
from apps.customers.serializers import CustomerSerializer
from core.permissions import IsBroker


class CustomerListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Customer.objects.filter(is_active=True).select_related('country', 'default_currency')
    serializer_class = CustomerSerializer


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Customer.objects.all().select_related('country', 'default_currency')
    serializer_class = CustomerSerializer
