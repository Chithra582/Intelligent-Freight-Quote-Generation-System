import uuid
import random
from django.db import models
from django.conf import settings
from apps.masterdata.models import Port, Airport, ContainerType, Commodity, Country
from apps.customers.models import Customer
from core.enums import TransportMode, LoadType, Incoterm, PackageType, ShipmentStatus


def generate_shipment_reference():
    num = random.randint(10000, 99999)
    return f"SHP-2026-{num}"


class Shipment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=30, unique=True, default=generate_shipment_reference, db_index=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='shipments')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_shipments')

    # Route gateways
    origin_port = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, blank=True, related_name='shipments_origin')
    destination_port = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, blank=True, related_name='shipments_dest')
    origin_airport = models.ForeignKey(Airport, on_delete=models.SET_NULL, null=True, blank=True, related_name='shipments_origin_air')
    destination_airport = models.ForeignKey(Airport, on_delete=models.SET_NULL, null=True, blank=True, related_name='shipments_dest_air')

    origin_code = models.CharField(max_length=10, blank=True, default='', db_index=True)
    destination_code = models.CharField(max_length=10, blank=True, default='', db_index=True)
    origin_name = models.CharField(max_length=150, blank=True, default='')
    destination_name = models.CharField(max_length=150, blank=True, default='')

    # Door pickup / delivery
    pickup_address = models.TextField(blank=True, default='')
    pickup_pin = models.CharField(max_length=20, blank=True, default='')
    delivery_address = models.TextField(blank=True, default='')
    delivery_pin = models.CharField(max_length=20, blank=True, default='')

    # Dates
    ready_date = models.DateField()
    required_delivery_date = models.DateField(null=True, blank=True)

    # Service mode
    mode = models.CharField(max_length=30, choices=TransportMode.choices, default=TransportMode.OCEAN)
    load_type = models.CharField(max_length=10, choices=LoadType.choices, default=LoadType.FCL)
    incoterm = models.CharField(max_length=10, choices=Incoterm.choices, default=Incoterm.FOB)

    # FCL Specific details
    container_type = models.CharField(max_length=15, blank=True, default='40HC')
    container_count = models.IntegerField(default=1)

    # Aggregated Weight / Volume
    gross_weight_kg = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    volumetric_weight_kg = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    chargeable_units = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    chargeable_basis = models.CharField(max_length=30, default='PER_CONTAINER')
    total_volume_cbm = models.DecimalField(max_digits=12, decimal_places=3, default=0)

    # Additional Special Handling
    declared_value = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    is_fragile = models.BooleanField(default=False)
    is_hazardous = models.BooleanField(default=False)
    un_number = models.CharField(max_length=20, blank=True, default='')
    imo_class = models.CharField(max_length=20, blank=True, default='')
    is_temperature_controlled = models.BooleanField(default=False)
    temp_min_c = models.FloatField(null=True, blank=True)
    temp_max_c = models.FloatField(null=True, blank=True)
    needs_insurance = models.BooleanField(default=False)
    special_instructions = models.TextField(blank=True, default='')

    # Contact Details
    contact_full_name = models.CharField(max_length=150, blank=True, default='')
    contact_company_name = models.CharField(max_length=150, blank=True, default='')
    contact_email = models.EmailField(blank=True, default='')
    contact_phone = models.CharField(max_length=50, blank=True, default='')
    contact_country = models.CharField(max_length=2, blank=True, default='IN')

    # Status State Machine
    status = models.CharField(max_length=30, choices=ShipmentStatus.choices, default=ShipmentStatus.ENQUIRY, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['origin_code', 'destination_code']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.reference} ({self.origin_code} -> {self.destination_code}) [{self.status}]"


class ShipmentItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='items')
    package_type = models.CharField(max_length=30, choices=PackageType.choices, default=PackageType.CARTON)
    commodity_description = models.CharField(max_length=255)
    hs_code = models.CharField(max_length=12, blank=True, default='')

    quantity = models.IntegerField(default=1)
    weight_per_unit_kg = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)
    length_cm = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    width_cm = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    height_cm = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    is_stackable = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.quantity} x {self.package_type} - {self.commodity_description}"
