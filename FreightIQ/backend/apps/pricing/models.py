import uuid
from django.db import models
from django.conf import settings
from apps.masterdata.models import Port, Carrier, Currency
from core.enums import CalculationType, SurchargeCode


class RateCard(models.Model):
    class RateType(models.TextChoices):
        CONTRACT = 'CONTRACT', 'Long-term Contract Rate'
        SPOT = 'SPOT', 'Spot Market Rate'
        TARIFF = 'TARIFF', 'Standard Public Tariff'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    carrier = models.ForeignKey(Carrier, on_delete=models.CASCADE, related_name='rate_cards')
    rate_type = models.CharField(max_length=20, choices=RateType.choices, default=RateType.CONTRACT)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, default='USD')
    valid_from = models.DateField()
    valid_to = models.DateField()
    is_active = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.carrier.code}) [{self.rate_type}]"


class RateCardLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rate_card = models.ForeignKey(RateCard, on_delete=models.CASCADE, related_name='lines')
    origin_port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='rates_origin')
    destination_port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='rates_dest')
    container_type = models.CharField(max_length=15, default='40HC')
    base_rate = models.DecimalField(max_digits=14, decimal_places=4)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, default='USD')
    min_charge = models.DecimalField(max_digits=14, decimal_places=4, default=0.0000)

    class Meta:
        indexes = [
            models.Index(fields=['origin_port', 'destination_port', 'container_type']),
        ]

    def __str__(self):
        return f"{self.origin_port.un_locode} -> {self.destination_port.un_locode} ({self.container_type}): {self.base_rate} {self.currency_id}"


class Surcharge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, choices=SurchargeCode.choices, default=SurchargeCode.BAF)
    name = models.CharField(max_length=150)
    calculation_type = models.CharField(max_length=30, choices=CalculationType.choices, default=CalculationType.FLAT)
    value = models.DecimalField(max_digits=14, decimal_places=4)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, default='USD')
    applies_to = models.JSONField(default=list)  # ['OCEAN', 'AIR']
    valid_from = models.DateField()
    valid_to = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.name} ({self.value} {self.calculation_type})"


class RateHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lane_key = models.CharField(max_length=50, db_index=True)
    container_type = models.CharField(max_length=15, default='40HC')
    carrier = models.ForeignKey(Carrier, on_delete=models.CASCADE)
    rate = models.DecimalField(max_digits=14, decimal_places=4)
    currency = models.CharField(max_length=3, default='USD')
    observed_at = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-observed_at']

    def __str__(self):
        return f"{self.lane_key} ({self.container_type}): {self.rate} {self.currency} on {self.observed_at}"
