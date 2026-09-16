import os
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.quotes.models import (
    FreightQuote, QuoteVersion, QuoteApproval, MarginPolicy, ApprovalRule, QuoteDocument
)
from apps.quotes.serializers import (
    FreightQuoteSerializer, BrokerQuoteVersionSerializer, CustomerQuoteVersionSerializer,
    CreateQuoteRequestSerializer, AdjustMarginSerializer, ApprovalDecisionSerializer,
    MarginPolicySerializer, ApprovalRuleSerializer, QuoteApprovalSerializer
)
from apps.quotes.services import QuoteService
from apps.shipments.models import Shipment
from apps.routing.models import Route
from core.enums import QuoteStatus, UserRole
from core.permissions import IsBroker, IsSeniorBroker, IsPricingManager, IsAdmin
from core.money import to_decimal


class QuoteListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = FreightQuote.objects.all().select_related(
            'shipment', 'customer', 'created_by'
        ).prefetch_related('versions__line_items', 'versions__carrier', 'versions__route').order_by('-created_at')

        # Tenant isolation for customers
        if user.role == UserRole.CUSTOMER:
            if user.customer_id:
                qs = qs.filter(customer_id=user.customer_id)
            elif user.organization_id:
                qs = qs.filter(created_by__organization_id=user.organization_id)
            else:
                qs = qs.filter(created_by=user)

        # Filters
        status_param = request.query_params.get('status')
        if status_param:
            qs = qs.filter(status__iexact=status_param)

        search = request.query_params.get('search')
        if search:
            qs = qs.filter(quote_number__icontains=search)

        serializer = FreightQuoteSerializer(qs, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data})

    def post(self, request):
        serializer = CreateQuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        shipment = get_object_or_404(Shipment, pk=data['shipment_id'])
        route = None
        if data.get('route_id'):
            route = get_object_or_404(Route, pk=data['route_id'])

        quote = QuoteService.create_quote(
            shipment=shipment,
            route=route,
            margin_pct=data.get('margin_pct', to_decimal('15.0')),
            target_currency=data.get('target_currency', 'USD'),
            created_by=request.user
        )

        out_serializer = FreightQuoteSerializer(quote, context={'request': request})
        return Response({
            'success': True,
            'message': f"Freight quote {quote.quote_number} (v1) created successfully.",
            'data': out_serializer.data
        }, status=status.HTTP_201_CREATED)


class QuoteDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user = request.user
        quote = get_object_or_404(
            FreightQuote.objects.select_related('shipment', 'customer').prefetch_related(
                'versions__line_items', 'versions__approvals', 'versions__route', 'versions__carrier'
            ),
            pk=pk
        )

        # Scoping
        if user.role == UserRole.CUSTOMER:
            if user.customer_id and quote.customer_id != user.customer_id:
                return Response({'success': False, 'error': {'message': 'Permission denied'}}, status=status.HTTP_403_FORBIDDEN)

        serializer = FreightQuoteSerializer(quote, context={'request': request})
        return Response({'success': True, 'data': serializer.data})


class QuoteAdjustMarginView(APIView):
    """
    PATCH /api/v1/quotes/{id}/margin/
    Creates a new immutable QuoteVersion with adjusted margin.
    """
    permission_classes = [IsBroker]

    def patch(self, request, pk):
        quote = get_object_or_404(FreightQuote, pk=pk)
        serializer = AdjustMarginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        new_version = QuoteService.adjust_margin(
            quote=quote,
            new_margin_pct=data['margin_pct'],
            user=request.user,
            reason=data.get('reason', '')
        )

        quote_serializer = FreightQuoteSerializer(quote, context={'request': request})
        return Response({
            'success': True,
            'message': f"Created new version v{new_version.version} for quote {quote.quote_number}.",
            'data': quote_serializer.data
        })


class QuoteApproveView(APIView):
    """
    POST /api/v1/quotes/{id}/approve/
    Senior Broker / Pricing Manager approval action.
    """
    permission_classes = [IsSeniorBroker]

    def post(self, request, pk):
        quote = get_object_or_404(FreightQuote, pk=pk)
        latest_ver = quote.versions.filter(version=quote.current_version).first()

        approvals = QuoteApproval.objects.filter(
            quote_version=latest_ver, decision=QuoteApproval.Decision.PENDING
        )

        comment = request.data.get('comment', 'Approved by authority.')
        for app in approvals:
            app.decision = QuoteApproval.Decision.APPROVED
            app.approver = request.user
            app.comment = comment
            app.decided_at = timezone.now()
            app.save()

        quote.status = QuoteStatus.APPROVED
        quote.save(update_fields=['status', 'updated_at'])

        return Response({
            'success': True,
            'message': f"Quote {quote.quote_number} (v{quote.current_version}) has been approved.",
            'status': quote.status
        })


class QuoteRejectView(APIView):
    """
    POST /api/v1/quotes/{id}/reject/
    """
    permission_classes = [IsSeniorBroker]

    def post(self, request, pk):
        quote = get_object_or_404(FreightQuote, pk=pk)
        reason = request.data.get('reason')
        if not reason:
            return Response({'success': False, 'error': {'message': 'Mandatory rejection reason is required.'}}, status=status.HTTP_400_BAD_REQUEST)

        latest_ver = quote.versions.filter(version=quote.current_version).first()
        approvals = QuoteApproval.objects.filter(
            quote_version=latest_ver, decision=QuoteApproval.Decision.PENDING
        )

        for app in approvals:
            app.decision = QuoteApproval.Decision.REJECTED
            app.approver = request.user
            app.comment = reason
            app.decided_at = timezone.now()
            app.save()

        quote.status = QuoteStatus.REJECTED
        quote.save(update_fields=['status', 'updated_at'])

        return Response({
            'success': True,
            'message': f"Quote {quote.quote_number} has been rejected.",
            'status': quote.status
        })


class QuoteIssueView(APIView):
    """
    POST /api/v1/quotes/{id}/issue/
    Issues approved quote to the customer and activates the validity countdown.
    """
    permission_classes = [IsBroker]

    def post(self, request, pk):
        quote = get_object_or_404(FreightQuote, pk=pk)
        quote.status = QuoteStatus.ISSUED
        quote.save(update_fields=['status', 'updated_at'])

        return Response({
            'success': True,
            'message': f"Quote {quote.quote_number} has been officially issued to the customer.",
            'status': quote.status
        })


class QuoteAcceptView(APIView):
    """
    POST /api/v1/quotes/{id}/accept/
    Customer acceptance. Only permitted once approved by Agent and Customs Officer (ISSUED / APPROVED).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        quote = get_object_or_404(FreightQuote, pk=pk)

        # Enforce that quote has been approved before acceptance
        if quote.status not in (QuoteStatus.ISSUED, QuoteStatus.APPROVED):
            return Response({
                'success': False,
                'error': {
                    'message': 'Quote cannot be accepted until approved by Freight Agent and Customs Officer.'
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        quote.status = QuoteStatus.ACCEPTED
        quote.save(update_fields=['status', 'updated_at'])

        quote.shipment.status = 'WON'
        quote.shipment.save(update_fields=['status'])

        return Response({
            'success': True,
            'message': f"Quote {quote.quote_number} successfully accepted. Deal converted to WON.",
            'status': quote.status
        })


class QuoteDeclineView(APIView):
    """
    POST /api/v1/quotes/{id}/decline/
    Customer decline.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        quote = get_object_or_404(FreightQuote, pk=pk)
        quote.status = QuoteStatus.DECLINED
        quote.save(update_fields=['status', 'updated_at'])

        return Response({
            'success': True,
            'message': f"Quote {quote.quote_number} declined.",
            'status': quote.status
        })


class QuoteDocumentDownloadView(APIView):
    """
    GET /api/v1/quotes/{id}/document/
    Streams generated PDF quotation file.
    Customer can only download after approval by Freight Agent and Customs Officer.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        quote = get_object_or_404(FreightQuote, pk=pk)
        user = request.user

        # Customer role can only access PDF once approved and issued
        if user.role == UserRole.CUSTOMER and quote.status not in (QuoteStatus.ISSUED, QuoteStatus.APPROVED, QuoteStatus.ACCEPTED):
            return Response({
                'success': False,
                'error': {
                    'message': 'Quotation PDF is not visible or accessible until approved by Freight Agent and Customs Officer.'
                }
            }, status=status.HTTP_403_FORBIDDEN)

        latest_ver = quote.versions.filter(version=quote.current_version).first()
        if not latest_ver:
            raise Http404("Quote version not found.")

        doc = latest_ver.documents.filter(document_type='PDF').first()

        if not doc or not os.path.exists(doc.file_path):
            raise Http404("Quotation PDF document has not yet been generated.")

        return FileResponse(open(doc.file_path, 'rb'), content_type='application/pdf', filename=doc.file_name)


class ApprovalQueueListView(generics.ListAPIView):
    """
    GET /api/v1/quotes/approvals/queue/
    Lists all quotes pending approval with breach reasons.
    """
    permission_classes = [IsSeniorBroker]
    serializer_class = QuoteApprovalSerializer

    def get_queryset(self):
        return QuoteApproval.objects.filter(
            decision=QuoteApproval.Decision.PENDING
        ).select_related('quote_version__quote', 'requested_by').order_by('-created_at')


class MarginPolicyListView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    queryset = MarginPolicy.objects.filter(is_active=True)
    serializer_class = MarginPolicySerializer


class ApprovalRuleListView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    queryset = ApprovalRule.objects.filter(is_active=True).order_by('order_index')
    serializer_class = ApprovalRuleSerializer
