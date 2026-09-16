from rest_framework import serializers
from apps.quotes.models import (
    FreightQuote, QuoteVersion, QuoteLineItem, QuoteApproval, QuoteDocument, MarginPolicy, ApprovalRule
)
from apps.routing.serializers import RouteSerializer
from apps.masterdata.serializers import CarrierSerializer
from core.enums import UserRole


class QuoteLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteLineItem
        fields = ['id', 'component_code', 'description', 'amount', 'currency', 'is_included_in_sell_rate']


class QuoteApprovalSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)

    class Meta:
        model = QuoteApproval
        fields = '__all__'


# 1. Internal Broker & Manager Version Serializer (Full Cost & Margin Visibility)
class BrokerQuoteVersionSerializer(serializers.ModelSerializer):
    line_items = QuoteLineItemSerializer(many=True, read_only=True)
    approvals = QuoteApprovalSerializer(many=True, read_only=True)
    route_details = RouteSerializer(source='route', read_only=True)
    carrier_details = CarrierSerializer(source='carrier', read_only=True)

    class Meta:
        model = QuoteVersion
        fields = [
            'id', 'version', 'route', 'route_details', 'carrier', 'carrier_details',
            'currency', 'fx_rate', 'fx_rate_date',
            'total_cost', 'margin_pct', 'margin_amount', 'final_quote',
            'transit_days', 'risk_score', 'win_probability', 'valid_until',
            'model_versions', 'data_as_of', 'assumptions', 'rationale', 'cost_breakdown',
            'line_items', 'approvals', 'created_at'
        ]


# 2. Customer Portal Version Serializer (CRITICAL SECURITY: Strictly ZERO Cost or Margin data)
class CustomerQuoteVersionSerializer(serializers.ModelSerializer):
    line_items = serializers.SerializerMethodField()
    route_details = RouteSerializer(source='route', read_only=True)
    carrier_name = serializers.CharField(source='carrier.name', read_only=True)

    class Meta:
        model = QuoteVersion
        fields = [
            'id', 'version', 'route_details', 'carrier_name',
            'currency', 'final_quote', 'transit_days', 'valid_until',
            'assumptions', 'line_items', 'created_at'
        ]

    def get_line_items(self, obj):
        # Only return sell-side line items
        items = obj.line_items.filter(is_included_in_sell_rate=True)
        return QuoteLineItemSerializer(items, many=True).data


# FreightQuote Serializer that dynamically toggles between Broker and Customer versions
class FreightQuoteSerializer(serializers.ModelSerializer):
    versions = serializers.SerializerMethodField()
    latest_version = serializers.SerializerMethodField()
    shipment_reference = serializers.CharField(source='shipment.reference', read_only=True)
    origin_code = serializers.CharField(source='shipment.origin_code', read_only=True)
    destination_code = serializers.CharField(source='shipment.destination_code', read_only=True)
    customer_name = serializers.CharField(source='customer.company_name', read_only=True)

    class Meta:
        model = FreightQuote
        fields = [
            'id', 'quote_number', 'shipment', 'shipment_reference', 'origin_code', 'destination_code',
            'customer', 'customer_name', 'current_version', 'status',
            'created_by', 'created_at', 'updated_at', 'latest_version', 'versions'
        ]
        read_only_fields = ['id', 'quote_number', 'created_at', 'updated_at']

    def _is_customer(self):
        req = self.context.get('request')
        return bool(req and req.user.is_authenticated and req.user.role == UserRole.CUSTOMER)

    def get_latest_version(self, obj):
        v = obj.versions.filter(version=obj.current_version).first()
        if not v:
            v = obj.versions.first()
        if not v:
            return None
        if self._is_customer():
            return CustomerQuoteVersionSerializer(v, context=self.context).data
        return BrokerQuoteVersionSerializer(v, context=self.context).data

    def get_versions(self, obj):
        vs = obj.versions.all()
        if self._is_customer():
            return CustomerQuoteVersionSerializer(vs, many=True, context=self.context).data
        return BrokerQuoteVersionSerializer(vs, many=True, context=self.context).data


class CreateQuoteRequestSerializer(serializers.Serializer):
    shipment_id = serializers.UUIDField(required=True)
    route_id = serializers.UUIDField(required=False)
    margin_pct = serializers.DecimalField(max_digits=6, decimal_places=3, required=False, default=15.000)
    target_currency = serializers.CharField(max_length=3, default='USD')


class AdjustMarginSerializer(serializers.Serializer):
    margin_pct = serializers.DecimalField(max_digits=6, decimal_places=3, required=True)
    reason = serializers.CharField(required=False, allow_blank=True)


class ApprovalDecisionSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=['APPROVED', 'REJECTED'])
    comment = serializers.CharField(required=False, allow_blank=True)


class MarginPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = MarginPolicy
        fields = '__all__'


class ApprovalRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalRule
        fields = '__all__'
