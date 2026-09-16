import uuid
import random
from datetime import datetime, timedelta
from django.db import models
from django.conf import settings
from apps.shipments.models import Shipment
from apps.customers.models import Customer
from apps.routing.models import Route
from apps.masterdata.models import Carrier, Currency
from core.enums import QuoteStatus, UserRole, MarginPolicyScope


def generate_quote_number():
    num = random.randint(10000, 99999)
    return f"QT-2026-{num}"


class MarginPolicy(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scope = models.CharField(max_length=30, choices=MarginPolicyScope.choices, default=MarginPolicyScope.GLOBAL)
    scope_key = models.CharField(max_length=100, blank=True, default='GLOBAL', db_index=True)
    floor_pct = models.DecimalField(max_digits=6, decimal_places=3, default=12.000)  # e.g., 12.0%
    target_pct = models.DecimalField(max_digits=6, decimal_places=3, default=18.000)  # e.g., 18.0%
    stretch_pct = models.DecimalField(max_digits=6, decimal_places=3, default=24.000)  # e.g., 24.0%
    is_active = models.BooleanField(default=True)
    effective_from = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.scope} [{self.scope_key}]: Floor {self.floor_pct}%, Target {self.target_pct}%"


class ApprovalRule(models.Model):
    class ConditionType(models.TextChoices):
        MARGIN_BELOW_FLOOR = 'MARGIN_BELOW_FLOOR', 'Margin Below Lane Policy Floor'
        HIGH_VALUE = 'HIGH_VALUE', 'Total Quote Value Exceeds Threshold'
        PREDICTED_RATES = 'PREDICTED_RATES', 'Uncontracted Predicted Rates Used'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_index = models.IntegerField(default=1)
    condition_type = models.CharField(max_length=50, choices=ConditionType.choices, default=ConditionType.MARGIN_BELOW_FLOOR)
    threshold_value = models.DecimalField(max_digits=14, decimal_places=4, default=0.0000)
    approver_role = models.CharField(max_length=30, choices=UserRole.choices, default=UserRole.SENIOR_BROKER)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order_index']

    def __str__(self):
        return f"Rule {self.order_index}: {self.condition_type} -> Approver: {self.approver_role}"


class FreightQuote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quote_number = models.CharField(max_length=30, unique=True, default=generate_quote_number, db_index=True)
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='quotes')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_quotes')
    current_version = models.SmallIntegerField(default=1)
    status = models.CharField(max_length=30, choices=QuoteStatus.choices, default=QuoteStatus.DRAFT, db_index=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.quote_number} (v{self.current_version}) [{self.status}]"


class QuoteVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quote = models.ForeignKey(FreightQuote, on_delete=models.CASCADE, related_name='versions')
    version = models.SmallIntegerField(default=1)

    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, related_name='quote_versions')
    carrier = models.ForeignKey(Carrier, on_delete=models.SET_NULL, null=True, related_name='carrier_quote_versions')

    currency = models.CharField(max_length=3, default='USD')
    fx_rate = models.DecimalField(max_digits=12, decimal_places=6, default=1.000000)
    fx_rate_date = models.DateField(auto_now_add=True)

    # Buy-side and Sell-side financials (Strict Decimal14,4)
    total_cost = models.DecimalField(max_digits=14, decimal_places=4)  # Buy side (Internal confidential)
    margin_pct = models.DecimalField(max_digits=6, decimal_places=3, default=15.000)  # e.g., 15.0%
    margin_amount = models.DecimalField(max_digits=14, decimal_places=4)  # Internal confidential
    final_quote = models.DecimalField(max_digits=14, decimal_places=4)  # Sell rate shown to customer

    transit_days = models.SmallIntegerField(default=10)
    risk_score = models.DecimalField(max_digits=5, decimal_places=4, default=0.1500)
    win_probability = models.DecimalField(max_digits=5, decimal_places=4, default=0.7500)

    valid_until = models.DateTimeField()

    # Reproducibility and Audit Freeze
    model_versions = models.JSONField(default=dict)
    data_as_of = models.JSONField(default=dict)
    assumptions = models.JSONField(default=list)
    rationale = models.JSONField(default=dict)
    cost_breakdown = models.JSONField(default=dict)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('quote', 'version')
        ordering = ['-version']

    def __str__(self):
        return f"{self.quote.quote_number} v{self.version} - Sell: {self.final_quote} {self.currency}"


class QuoteLineItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quote_version = models.ForeignKey(QuoteVersion, on_delete=models.CASCADE, related_name='line_items')
    component_code = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=14, decimal_places=4)
    currency = models.CharField(max_length=3, default='USD')
    is_included_in_sell_rate = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.component_code}: {self.amount} {self.currency}"


class QuoteApproval(models.Model):
    class Decision(models.TextChoices):
        PENDING = 'PENDING', 'Pending Decision'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quote_version = models.ForeignKey(QuoteVersion, on_delete=models.CASCADE, related_name='approvals')
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='approval_requests')
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_quotes')
    approver_role = models.CharField(max_length=30, choices=UserRole.choices, default=UserRole.SENIOR_BROKER)
    threshold_breached = models.CharField(max_length=255)
    reason = models.TextField(blank=True, default='')
    decision = models.CharField(max_length=20, choices=Decision.choices, default=Decision.PENDING)
    comment = models.TextField(blank=True, default='')
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Approval for {self.quote_version.quote.quote_number} v{self.quote_version.version} [{self.decision}]"


class QuoteDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quote_version = models.ForeignKey(QuoteVersion, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=30, default='PDF')
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document_type}: {self.file_name}"


# Milestone 4 Models Export
from apps.quotes.m4_models import (
    FreightCompany,
    CompanyAgentProfile,
    CompanyQuoteOption,
    QuoteSelection,
    VerificationRequest,
    QuoteRevision,
    Booking,
    M4StatusHistory,
    M4Notification,
)

