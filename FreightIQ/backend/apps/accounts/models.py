import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from core.enums import UserRole


class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    country = models.CharField(max_length=2, default='IN')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=30,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER,
        db_index=True
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    customer_id = models.UUIDField(null=True, blank=True, help_text="Scoping ID for customer-portal tenancy")
    phone = models.CharField(max_length=30, blank=True, default='')
    company_name = models.CharField(max_length=255, blank=True, default='')
    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_full_name(self):
        fn = f"{self.first_name} {self.last_name}".strip()
        return fn or self.username

    def __str__(self):
        return f"{self.username} [{self.role}]"
