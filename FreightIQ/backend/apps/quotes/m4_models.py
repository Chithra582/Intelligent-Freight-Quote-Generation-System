import uuid
import random
from django.db import models
from django.conf import settings
from apps.shipments.models import Shipment
from apps.customers.models import Customer
from core.enums import M4WorkflowStatus


def generate_company_id():
    num = random.randint(100, 999)
    return f"CMP-{num}"


def generate_booking_reference():
    num = random.randint(10000, 99999)
    return f"BK-2026-{num}"


class FreightCompany(models.Model):
    class CompanyStatus(models.TextChoices):
        PENDING_VERIFICATION = 'PENDING_VERIFICATION', 'Pending Admin Verification'
        APPROVED = 'APPROVED', 'Approved by Admin'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_id = models.CharField(max_length=20, unique=True, default=generate_company_id, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    legal_name = models.CharField(max_length=255, blank=True, default='')
    license_no = models.CharField(max_length=100, blank=True, default='')
    modes = models.JSONField(default=list, help_text="Supported modes e.g. ['Ocean', 'Air', 'Road', 'Rail']")
    contact_email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=50, blank=True, default='')
    status = models.CharField(max_length=30, choices=CompanyStatus.choices, default=CompanyStatus.PENDING_VERIFICATION, db_index=True)
    is_eligible = models.BooleanField(default=False, help_text="Eligible to be recommended to customers when verified & approved")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.8)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_companies')
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.company_id}) - {self.status} [Eligible: {self.is_eligible}]"


class CompanyAgentProfile(models.Model):
    class AgentRole(models.TextChoices):
        MANAGER = 'MANAGER', 'Company Manager'
        AGENT = 'AGENT', 'Verification Agent'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='company_agent_profile')
    company = models.ForeignKey(FreightCompany, on_delete=models.CASCADE, related_name='agents')
    company_role = models.CharField(max_length=20, choices=AgentRole.choices, default=AgentRole.AGENT)
    agent_code = models.CharField(max_length=20, blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.company.name} ({self.company_role})"


class CompanyQuoteOption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quote_number = models.CharField(max_length=30, unique=True, db_index=True)  # e.g. QT-5001
    company = models.ForeignKey(FreightCompany, on_delete=models.CASCADE, related_name='quote_options')
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, null=True, blank=True, related_name='m4_quote_options')
    origin = models.CharField(max_length=150, default='Chennai, India')
    destination = models.CharField(max_length=150, default='Rotterdam, Netherlands')
    mode = models.CharField(max_length=50, default='Sea Freight')
    container = models.CharField(max_length=50, default='40 FT')
    cargo = models.CharField(max_length=150, default='Electronics')
    weight_kg = models.DecimalField(max_digits=12, decimal_places=2, default=5000)
    price = models.DecimalField(max_digits=14, decimal_places=2, default=85000)
    currency = models.CharField(max_length=5, default='INR')
    transit_days = models.IntegerField(default=24)
    risk_level = models.CharField(max_length=20, default='Low')
    valid_until = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quote_number} - {self.company.name}: {self.price} {self.currency}"


class QuoteSelection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    selection_number = models.CharField(max_length=30, unique=True, db_index=True)
    quote_option = models.ForeignKey(CompanyQuoteOption, on_delete=models.CASCADE, related_name='selections')
    shipment = models.ForeignKey(Shipment, on_delete=models.SET_NULL, null=True, blank=True, related_name='quote_selections')
    company = models.ForeignKey(FreightCompany, on_delete=models.CASCADE, related_name='selections')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='m4_quote_selections')
    customer_name = models.CharField(max_length=255, default='ABC Electronics Pvt Ltd')
    selected_price = models.DecimalField(max_digits=14, decimal_places=2)
    currency = models.CharField(max_length=5, default='INR')
    status = models.CharField(
        max_length=40,
        choices=M4WorkflowStatus.choices,
        default=M4WorkflowStatus.PENDING_COMPANY_VERIFICATION,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.selection_number} -> {self.company.name} [{self.status}]"


class VerificationRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    selection = models.OneToOneField(QuoteSelection, on_delete=models.CASCADE, related_name='verification_request')
    assigned_agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_verifications')
    status = models.CharField(
        max_length=40,
        choices=M4WorkflowStatus.choices,
        default=M4WorkflowStatus.PENDING_COMPANY_VERIFICATION
    )
    checklist = models.JSONField(default=dict, help_text="Stores checklist items: shipment, cargo, capacity, route, schedule, documents, commercial, risk, validity")
    remarks = models.TextField(blank=True, default='')
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Verification for {self.selection.selection_number} [{self.status}]"


class QuoteRevision(models.Model):
    class RevisionStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Customer Acceptance'
        ACCEPTED = 'ACCEPTED', 'Accepted by Customer'
        REJECTED = 'REJECTED', 'Rejected by Customer'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    selection = models.ForeignKey(QuoteSelection, on_delete=models.CASCADE, related_name='revisions')
    original_price = models.DecimalField(max_digits=14, decimal_places=2)
    revised_price = models.DecimalField(max_digits=14, decimal_places=2)
    original_eta_days = models.IntegerField(default=28)
    revised_eta_days = models.IntegerField(default=28)
    reason = models.TextField(help_text="Reason for price or terms modification e.g. Fuel surcharge increase")
    status = models.CharField(max_length=20, choices=RevisionStatus.choices, default=RevisionStatus.PENDING)
    revised_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    customer_response_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Revision for {self.selection.selection_number}: {self.original_price} -> {self.revised_price} [{self.status}]"


class Booking(models.Model):
    class BookingStatus(models.TextChoices):
        CONFIRMED = 'BOOKING_CONFIRMED', 'Booking Confirmed'
        CANCELLED = 'BOOKING_CANCELLED', 'Booking Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_reference = models.CharField(max_length=30, unique=True, default=generate_booking_reference, db_index=True)
    selection = models.OneToOneField(QuoteSelection, on_delete=models.CASCADE, related_name='booking')
    shipment = models.ForeignKey(Shipment, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    company = models.ForeignKey(FreightCompany, on_delete=models.CASCADE, related_name='bookings')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    final_price = models.DecimalField(max_digits=14, decimal_places=2)
    currency = models.CharField(max_length=5, default='INR')
    status = models.CharField(max_length=30, choices=BookingStatus.choices, default=BookingStatus.CONFIRMED, db_index=True)
    assigned_agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='agent_bookings')
    confirmed_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.booking_reference} - {self.company.name} [{self.status}]"


class M4StatusHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    selection = models.ForeignKey(QuoteSelection, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=40)
    new_status = models.CharField(max_length=40)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    remarks = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.selection.selection_number}: {self.old_status} -> {self.new_status}"


class M4Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='m4_notifications')
    company = models.ForeignKey(FreightCompany, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    entity_id = models.CharField(max_length=50, blank=True, default='')
    notification_type = models.CharField(max_length=50, default='WORKFLOW_UPDATE')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification: {self.message[:40]}"
