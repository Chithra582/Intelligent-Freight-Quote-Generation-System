import uuid
from django.db import models
from django.conf import settings
from apps.masterdata.models import Country, Currency
from core.enums import CustomerTier


class Customer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=200, db_index=True)
    customer_code = models.CharField(max_length=50, unique=True)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, related_name='customers')
    tier = models.CharField(max_length=30, choices=CustomerTier.choices, default=CustomerTier.STANDARD)
    credit_status = models.CharField(max_length=50, default='Approved - Standard Credit ($50,000)')
    default_currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True, blank=True)
    payment_terms = models.CharField(max_length=50, default='Net 30 Days')
    account_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_customers'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name} ({self.customer_code}) [{self.tier}]"


class CustomerContact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True, default='')
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.customer.company_name}"
