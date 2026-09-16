from rest_framework import serializers
from apps.quotes.m4_models import (
    FreightCompany,
    CompanyAgentProfile,
    CompanyQuoteOption,
    QuoteSelection,
    VerificationRequest,
    QuoteRevision,
    Booking,
    M4StatusHistory,
    M4Notification
)
from apps.accounts.models import User


class FreightCompanySerializer(serializers.ModelSerializer):
    agents_count = serializers.SerializerMethodField()

    class Meta:
        model = FreightCompany
        fields = [
            'id', 'company_id', 'name', 'legal_name', 'license_no',
            'modes', 'contact_email', 'phone', 'status', 'is_eligible',
            'rating', 'agents_count', 'verified_at', 'created_at'
        ]
        read_only_fields = ['id', 'company_id', 'created_at']

    def get_agents_count(self, obj):
        return obj.agents.count()


class CompanyAgentProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_code = serializers.CharField(source='company.company_id', read_only=True)

    class Meta:
        model = CompanyAgentProfile
        fields = [
            'id', 'user', 'user_email', 'user_name', 'company',
            'company_name', 'company_code', 'company_role',
            'agent_code', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CompanyQuoteOptionSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_code = serializers.CharField(source='company.company_id', read_only=True)
    company_rating = serializers.DecimalField(source='company.rating', max_digits=3, decimal_places=1, read_only=True)

    class Meta:
        model = CompanyQuoteOption
        fields = [
            'id', 'quote_number', 'company', 'company_name', 'company_code',
            'company_rating', 'shipment', 'origin', 'destination', 'mode',
            'container', 'cargo', 'weight_kg', 'price', 'currency',
            'transit_days', 'risk_level', 'valid_until', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class QuoteRevisionSerializer(serializers.ModelSerializer):
    revised_by_name = serializers.CharField(source='revised_by.get_full_name', read_only=True)

    class Meta:
        model = QuoteRevision
        fields = [
            'id', 'selection', 'original_price', 'revised_price',
            'original_eta_days', 'revised_eta_days', 'reason',
            'status', 'revised_by', 'revised_by_name',
            'customer_response_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class QuoteSelectionSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_code = serializers.CharField(source='company.company_id', read_only=True)
    quote_details = CompanyQuoteOptionSerializer(source='quote_option', read_only=True)
    revisions = QuoteRevisionSerializer(many=True, read_only=True)

    class Meta:
        model = QuoteSelection
        fields = [
            'id', 'selection_number', 'quote_option', 'quote_details',
            'shipment', 'company', 'company_name', 'company_code',
            'customer', 'customer_name', 'selected_price', 'currency',
            'status', 'revisions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'selection_number', 'created_at', 'updated_at']


class VerificationRequestSerializer(serializers.ModelSerializer):
    selection_details = QuoteSelectionSerializer(source='selection', read_only=True)
    assigned_agent_name = serializers.CharField(source='assigned_agent.get_full_name', read_only=True)

    class Meta:
        model = VerificationRequest
        fields = [
            'id', 'selection', 'selection_details', 'assigned_agent',
            'assigned_agent_name', 'status', 'checklist', 'remarks',
            'verified_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookingSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_code = serializers.CharField(source='company.company_id', read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    selection_details = QuoteSelectionSerializer(source='selection', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'selection', 'selection_details',
            'shipment', 'company', 'company_name', 'company_code',
            'customer', 'customer_email', 'final_price', 'currency',
            'status', 'assigned_agent', 'confirmed_at', 'updated_at'
        ]
        read_only_fields = ['id', 'booking_reference', 'confirmed_at', 'updated_at']


class M4StatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = M4StatusHistory
        fields = [
            'id', 'selection', 'old_status', 'new_status',
            'changed_by', 'changed_by_name', 'remarks', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class M4NotificationSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = M4Notification
        fields = [
            'id', 'recipient', 'company', 'company_name',
            'entity_id', 'notification_type', 'message',
            'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
