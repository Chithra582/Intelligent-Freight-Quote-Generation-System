import random
from datetime import datetime, timedelta
from rest_framework import views, generics, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from apps.accounts.models import User
from core.enums import UserRole, M4WorkflowStatus
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
    generate_company_id,
    generate_booking_reference
)
from apps.quotes.m4_serializers import (
    FreightCompanySerializer,
    CompanyAgentProfileSerializer,
    CompanyQuoteOptionSerializer,
    QuoteSelectionSerializer,
    VerificationRequestSerializer,
    QuoteRevisionSerializer,
    BookingSerializer,
    M4StatusHistorySerializer,
    M4NotificationSerializer
)


class CompanyListCreateView(views.APIView):
    """
    GET: List companies (all for admin, eligible only for customer)
    POST: Register a new freight company (status defaults to PENDING_VERIFICATION)
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        only_eligible = request.query_params.get('eligible', 'false').lower() == 'true'
        user = request.user if request.user.is_authenticated else None

        if only_eligible or (user and user.role == UserRole.CUSTOMER):
            companies = FreightCompany.objects.filter(is_eligible=True, status=FreightCompany.CompanyStatus.APPROVED)
        else:
            companies = FreightCompany.objects.all()

        serializer = FreightCompanySerializer(companies, many=True)
        return Response({'success': True, 'data': serializer.data})

    def post(self, request):
        data = request.data.copy()
        name = data.get('name', '').strip()
        contact_email = data.get('contact_email', '').strip()

        if not name or not contact_email:
            return Response(
                {'success': False, 'error': {'message': 'Company name and contact email are required'}},
                status=status.HTTP_400_BAD_REQUEST
            )

        company = FreightCompany.objects.create(
            company_id=generate_company_id(),
            name=name,
            legal_name=data.get('legal_name', name),
            license_no=data.get('license_no', f"LIC-2026-{random.randint(1000, 9999)}"),
            modes=data.get('modes', ['Ocean', 'Air', 'Road']),
            contact_email=contact_email,
            phone=data.get('phone', '+91 98000 00000'),
            status=FreightCompany.CompanyStatus.PENDING_VERIFICATION,
            is_eligible=False,
            rating=data.get('rating', 4.8)
        )

        serializer = FreightCompanySerializer(company)
        return Response(
            {
                'success': True,
                'message': 'Company registration submitted for Admin verification.',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )


class CompanyApprovalView(views.APIView):
    """
    POST: Admin verifies and approves/rejects company and toggles eligibility
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        company = get_object_or_404(FreightCompany, pk=pk)
        action = request.data.get('action', 'APPROVE').upper()  # APPROVE, REJECT, TOGGLE_ELIGIBLE

        if action == 'APPROVE':
            company.status = FreightCompany.CompanyStatus.APPROVED
            company.is_eligible = True
            company.verified_at = timezone.now()
            if request.user.is_authenticated:
                company.verified_by = request.user
            company.save()
            msg = f"Company '{company.name}' verified and approved. It is now ELIGIBLE for customer quote recommendations."
        elif action == 'REJECT':
            company.status = FreightCompany.CompanyStatus.REJECTED
            company.is_eligible = False
            company.save()
            msg = f"Company '{company.name}' registration has been rejected."
        elif action == 'TOGGLE_ELIGIBLE':
            company.is_eligible = not company.is_eligible
            company.save()
            msg = f"Company '{company.name}' eligibility set to {company.is_eligible}."
        else:
            return Response({'success': False, 'error': {'message': f"Invalid action: {action}"}}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'success': True, 'message': msg, 'data': FreightCompanySerializer(company).data})


class CompanyAgentManagementView(views.APIView):
    """
    GET: List agents for a company (scoping to company_id)
    POST: Company Manager adds a new agent with email and password
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, company_id):
        company = get_object_or_404(FreightCompany, company_id=company_id)
        agents = CompanyAgentProfile.objects.filter(company=company).select_related('user', 'company')
        serializer = CompanyAgentProfileSerializer(agents, many=True)
        return Response({'success': True, 'company': FreightCompanySerializer(company).data, 'data': serializer.data})

    def post(self, request, company_id):
        company = get_object_or_404(FreightCompany, company_id=company_id)
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        full_name = request.data.get('full_name', 'Company Agent').strip()
        role_type = request.data.get('role', 'AGENT').upper()

        if not email or not password:
            return Response(
                {'success': False, 'error': {'message': 'Agent email and password are required'}},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Check or create user
            user = User.objects.filter(email=email).first()
            if not user:
                username = email.split('@')[0] + f"_{random.randint(100, 999)}"
                first_name = full_name.split()[0] if full_name else 'Agent'
                last_name = " ".join(full_name.split()[1:]) if len(full_name.split()) > 1 else ''
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    role=UserRole.COMPANY_AGENT if role_type == 'AGENT' else UserRole.COMPANY_MANAGER,
                    company_name=company.name
                )
            else:
                user.set_password(password)
                user.company_name = company.name
                user.role = UserRole.COMPANY_AGENT if role_type == 'AGENT' else UserRole.COMPANY_MANAGER
                user.save()

            agent_code = f"AGT-{random.randint(100, 999)}"
            profile, created = CompanyAgentProfile.objects.get_or_create(
                user=user,
                defaults={
                    'company': company,
                    'company_role': role_type,
                    'agent_code': agent_code,
                    'is_active': True
                }
            )
            if not created:
                profile.company = company
                profile.company_role = role_type
                profile.save()

        return Response(
            {
                'success': True,
                'message': f"Agent '{full_name}' ({email}) successfully created and assigned to {company.name}.",
                'data': CompanyAgentProfileSerializer(profile).data
            },
            status=status.HTTP_201_CREATED
        )


class MultiCompanyQuoteGenerationView(views.APIView):
    """
    POST: Generate AI quote options from all ELIGIBLE freight companies
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data or {}
        origin = data.get('origin', 'Chennai, India')
        destination = data.get('destination', 'Rotterdam, Netherlands')
        mode = data.get('mode', 'Sea Freight')
        container = data.get('container', '40 FT')
        cargo = data.get('cargo', 'Electronics')
        weight_kg = float(data.get('weight_kg', 5000))

        # Retrieve eligible companies only
        eligible_companies = list(FreightCompany.objects.filter(is_eligible=True, status=FreightCompany.CompanyStatus.APPROVED))

        # If none in DB yet, seed sample companies matching PDF Page 14
        if not eligible_companies:
            c1, _ = FreightCompany.objects.get_or_create(
                company_id='CMP-101',
                defaults={
                    'name': 'OceanLink Logistics',
                    'contact_email': 'ops@oceanlink.com',
                    'modes': ['Ocean', 'Air', 'Road'],
                    'status': FreightCompany.CompanyStatus.APPROVED,
                    'is_eligible': True,
                    'rating': 4.9
                }
            )
            c2, _ = FreightCompany.objects.get_or_create(
                company_id='CMP-102',
                defaults={
                    'name': 'GlobalSea Freight',
                    'contact_email': 'dispatch@globalsea.com',
                    'modes': ['Ocean', 'Air'],
                    'status': FreightCompany.CompanyStatus.APPROVED,
                    'is_eligible': True,
                    'rating': 4.7
                }
            )
            c3, _ = FreightCompany.objects.get_or_create(
                company_id='CMP-103',
                defaults={
                    'name': 'FastRoute Cargo',
                    'contact_email': 'support@fastroute.com',
                    'modes': ['Ocean', 'Road', 'Rail'],
                    'status': FreightCompany.CompanyStatus.APPROVED,
                    'is_eligible': True,
                    'rating': 4.8
                }
            )
            eligible_companies = [c1, c2, c3]

        quotes_data = []
        pricing_presets = [
            {'price': 85000, 'transit_days': 24, 'risk': 'Low'},
            {'price': 80000, 'transit_days': 28, 'risk': 'Medium'},
            {'price': 92000, 'transit_days': 20, 'risk': 'Low'},
        ]

        for idx, comp in enumerate(eligible_companies):
            preset = pricing_presets[idx % len(pricing_presets)]
            q_num = f"QT-500{idx + 1}"
            opt, _ = CompanyQuoteOption.objects.get_or_create(
                quote_number=q_num,
                company=comp,
                defaults={
                    'origin': origin,
                    'destination': destination,
                    'mode': mode,
                    'container': container,
                    'cargo': cargo,
                    'weight_kg': weight_kg,
                    'price': preset['price'],
                    'currency': 'INR',
                    'transit_days': preset['transit_days'],
                    'risk_level': preset['risk'],
                    'valid_until': timezone.now().date() + timedelta(days=7)
                }
            )
            quotes_data.append(CompanyQuoteOptionSerializer(opt).data)

        return Response({'success': True, 'data': quotes_data})


class QuoteSelectionView(views.APIView):
    """
    GET: List selections (scoped by role/company)
    POST: Customer selects a company quote option -> triggers PENDING_COMPANY_VERIFICATION
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        company_id = request.query_params.get('company_id')
        user = request.user if request.user.is_authenticated else None

        qs = QuoteSelection.objects.all().select_related('company', 'quote_option').prefetch_related('revisions')

        if company_id:
            qs = qs.filter(company__company_id=company_id)
        elif user and user.role in [UserRole.COMPANY_AGENT, UserRole.COMPANY_MANAGER]:
            agent_prof = CompanyAgentProfile.objects.filter(user=user).first()
            if agent_prof:
                qs = qs.filter(company=agent_prof.company)

        serializer = QuoteSelectionSerializer(qs.order_by('-created_at'), many=True)
        return Response({'success': True, 'data': serializer.data})

    def post(self, request):
        quote_number = request.data.get('quote_number')
        customer_name = request.data.get('customer_name', 'ABC Electronics Pvt Ltd')

        quote_opt = get_object_or_404(CompanyQuoteOption, quote_number=quote_number)
        sel_num = f"SEL-2026-{random.randint(1000, 9999)}"

        with transaction.atomic():
            selection = QuoteSelection.objects.create(
                selection_number=sel_num,
                quote_option=quote_opt,
                company=quote_opt.company,
                customer=request.user if request.user.is_authenticated else None,
                customer_name=customer_name,
                selected_price=quote_opt.price,
                currency=quote_opt.currency,
                status=M4WorkflowStatus.PENDING_COMPANY_VERIFICATION
            )

            # Create corresponding verification request
            VerificationRequest.objects.create(
                selection=selection,
                status=M4WorkflowStatus.PENDING_COMPANY_VERIFICATION,
                checklist={
                    'shipment': True,
                    'cargo': True,
                    'capacity': True,
                    'route': True,
                    'schedule': True,
                    'documents': True,
                    'commercial': True,
                    'risk_context': True,
                    'quote_validity': True
                },
                remarks='Auto-initialized on customer quote selection'
            )

            # Log status history
            M4StatusHistory.objects.create(
                selection=selection,
                old_status=M4WorkflowStatus.QUOTE_OPTIONS_AVAILABLE,
                new_status=M4WorkflowStatus.PENDING_COMPANY_VERIFICATION,
                changed_by=request.user if request.user.is_authenticated else None,
                remarks=f"Customer selected quote {quote_opt.quote_number} ({quote_opt.company.name})"
            )

            # Create notification for company
            M4Notification.objects.create(
                company=quote_opt.company,
                entity_id=selection.selection_number,
                notification_type='NEW_SELECTION',
                message=f"New quote selection {selection.selection_number} received from {customer_name}. Verification required."
            )

        return Response(
            {
                'success': True,
                'message': f"Selected quote {quote_number}. Dispatched to {quote_opt.company.name} verification agent.",
                'data': QuoteSelectionSerializer(selection).data
            },
            status=status.HTTP_201_CREATED
        )


class VerificationActionView(views.APIView):
    """
    POST: Company Agent reviews and submits decision:
      - APPROVE -> BOOKING_CONFIRMED (creates booking reference BK-2026-XXXXX)
      - MODIFY -> REVISION_PENDING_CUSTOMER (requires reason and new price)
      - REJECT -> REJECTED (stores reason)
      - REQUEST_INFO -> AWAITING_CUSTOMER_INFO (requires missing info notes)
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, selection_id):
        selection = get_object_or_404(QuoteSelection, pk=selection_id)
        action = request.data.get('action', 'APPROVE').upper()
        reason = request.data.get('reason', '').strip()
        new_price = request.data.get('new_price')
        checklist = request.data.get('checklist', {})

        old_status = selection.status

        with transaction.atomic():
            v_req = getattr(selection, 'verification_request', None)
            if v_req:
                v_req.checklist = checklist
                v_req.remarks = reason
                v_req.verified_at = timezone.now()

            if action == 'APPROVE':
                selection.status = M4WorkflowStatus.PENDING_CUSTOMS_APPROVAL
                selection.save()

                if v_req:
                    v_req.status = M4WorkflowStatus.APPROVED
                    v_req.save()

                M4StatusHistory.objects.create(
                    selection=selection,
                    old_status=old_status,
                    new_status=M4WorkflowStatus.PENDING_CUSTOMS_APPROVAL,
                    changed_by=request.user if request.user.is_authenticated else None,
                    remarks="Company agent verified and approved shipment details. Forwarded to Customs Officer for statutory regulatory review."
                )

                # Automated notification to customs officers
                M4Notification.objects.create(
                    company=selection.company,
                    entity_id=str(selection.id),
                    notification_type='CUSTOMS_REVIEW_REQUIRED',
                    message=f"Shipment {selection.selection_number} approved by {selection.company.name} agent. Pending customs regulatory clearance."
                )

                return Response({
                    'success': True,
                    'status': M4WorkflowStatus.PENDING_CUSTOMS_APPROVAL,
                    'message': f"Shipment operationally approved by company agent! Request forwarded to Customs Officer desk for regulatory clearance.",
                    'data': QuoteSelectionSerializer(selection).data
                })

            elif action == 'MODIFY':
                if not new_price or not reason:
                    return Response(
                        {'success': False, 'error': {'message': 'Both revised price and modification reason are mandatory.'}},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                selection.status = M4WorkflowStatus.REVISION_PENDING_CUSTOMER
                selection.save()

                if v_req:
                    v_req.status = M4WorkflowStatus.REVISION_PENDING_CUSTOMER
                    v_req.save()

                revision = QuoteRevision.objects.create(
                    selection=selection,
                    original_price=selection.selected_price,
                    revised_price=new_price,
                    reason=reason,
                    status=QuoteRevision.RevisionStatus.PENDING,
                    revised_by=request.user if request.user.is_authenticated else None
                )

                M4StatusHistory.objects.create(
                    selection=selection,
                    old_status=old_status,
                    new_status=M4WorkflowStatus.REVISION_PENDING_CUSTOMER,
                    changed_by=request.user if request.user.is_authenticated else None,
                    remarks=f"Price revised from {selection.selected_price} to {new_price}. Reason: {reason}"
                )

                return Response({
                    'success': True,
                    'status': M4WorkflowStatus.REVISION_PENDING_CUSTOMER,
                    'message': 'Quote revised. Waiting for customer acceptance.',
                    'revision': QuoteRevisionSerializer(revision).data
                })

            elif action == 'REJECT':
                selection.status = M4WorkflowStatus.REJECTED
                selection.save()

                if v_req:
                    v_req.status = M4WorkflowStatus.REJECTED
                    v_req.save()

                M4StatusHistory.objects.create(
                    selection=selection,
                    old_status=old_status,
                    new_status=M4WorkflowStatus.REJECTED,
                    changed_by=request.user if request.user.is_authenticated else None,
                    remarks=f"Request rejected by company agent. Reason: {reason or 'Capacity constraint'}"
                )

                return Response({
                    'success': True,
                    'status': M4WorkflowStatus.REJECTED,
                    'message': 'Request rejected. Customer may choose another company quote option.'
                })

            elif action == 'REQUEST_INFO':
                selection.status = M4WorkflowStatus.AWAITING_CUSTOMER_INFO
                selection.save()

                if v_req:
                    v_req.status = M4WorkflowStatus.AWAITING_CUSTOMER_INFO
                    v_req.save()

                M4StatusHistory.objects.create(
                    selection=selection,
                    old_status=old_status,
                    new_status=M4WorkflowStatus.AWAITING_CUSTOMER_INFO,
                    changed_by=request.user if request.user.is_authenticated else None,
                    remarks=f"Agent requested additional documents/info: {reason}"
                )

                return Response({
                    'success': True,
                    'status': M4WorkflowStatus.AWAITING_CUSTOMER_INFO,
                    'message': 'Requested additional information from customer.'
                })

        return Response({'success': False, 'error': {'message': 'Unknown action'}}, status=status.HTTP_400_BAD_REQUEST)


class RevisionResponseView(views.APIView):
    """
    POST: Customer responds to agent's price revision:
      - ACCEPT -> BOOKING_CONFIRMED
      - REJECT -> RESELECT_QUOTE
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, revision_id):
        revision = get_object_or_404(QuoteRevision, pk=revision_id)
        action = request.data.get('action', 'ACCEPT').upper()

        selection = revision.selection

        with transaction.atomic():
            if action == 'ACCEPT':
                revision.status = QuoteRevision.RevisionStatus.ACCEPTED
                revision.customer_response_at = timezone.now()
                revision.save()

                selection.selected_price = revision.revised_price
                selection.status = M4WorkflowStatus.BOOKING_CONFIRMED
                selection.save()

                booking, _ = Booking.objects.get_or_create(
                    selection=selection,
                    defaults={
                        'company': selection.company,
                        'customer': selection.customer,
                        'final_price': revision.revised_price,
                        'currency': selection.currency,
                        'status': Booking.BookingStatus.CONFIRMED
                    }
                )

                M4StatusHistory.objects.create(
                    selection=selection,
                    old_status=M4WorkflowStatus.REVISION_PENDING_CUSTOMER,
                    new_status=M4WorkflowStatus.BOOKING_CONFIRMED,
                    changed_by=request.user if request.user.is_authenticated else None,
                    remarks=f"Customer accepted revision ({revision.revised_price}). Booking {booking.booking_reference} confirmed."
                )

                return Response({
                    'success': True,
                    'status': M4WorkflowStatus.BOOKING_CONFIRMED,
                    'booking_reference': booking.booking_reference,
                    'message': f"Revision accepted! Booking reference: {booking.booking_reference}",
                    'data': BookingSerializer(booking).data
                })

            elif action == 'REJECT':
                revision.status = QuoteRevision.RevisionStatus.REJECTED
                revision.customer_response_at = timezone.now()
                revision.save()

                selection.status = M4WorkflowStatus.RESELECT_QUOTE
                selection.save()

                M4StatusHistory.objects.create(
                    selection=selection,
                    old_status=M4WorkflowStatus.REVISION_PENDING_CUSTOMER,
                    new_status=M4WorkflowStatus.RESELECT_QUOTE,
                    changed_by=request.user if request.user.is_authenticated else None,
                    remarks="Customer rejected price revision. Allowed to re-select another quote option."
                )

                return Response({
                    'success': True,
                    'status': M4WorkflowStatus.RESELECT_QUOTE,
                    'message': 'Revision rejected. You can now select an alternate quote option.'
                })

        return Response({'success': False, 'error': {'message': 'Invalid action'}}, status=status.HTTP_400_BAD_REQUEST)


class BookingListView(generics.ListAPIView):
    """
    GET: List confirmed bookings (scoped by company or customer)
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = BookingSerializer

    def get_queryset(self):
        company_id = self.request.query_params.get('company_id')
        qs = Booking.objects.all().select_related('company', 'selection', 'customer').order_by('-confirmed_at')
        if company_id:
            qs = qs.filter(company__company_id=company_id)
        return qs


class CustomsClearanceActionView(views.APIView):
    """
    POST: Customs officer reviews documents & compliance, granting regulatory clearance.
    Transitions request from PENDING_CUSTOMS_APPROVAL -> VERIFIED_PENDING_CUSTOMER.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, selection_id):
        selection = get_object_or_404(QuoteSelection, pk=selection_id)
        action = request.data.get('action', 'APPROVE').upper()
        remarks = request.data.get('remarks', 'HS Code classification and export declarations verified.').strip()
        clearance_id = request.data.get('clearance_id') or f"CUS-2026-{random.randint(10000, 99999)}"

        old_status = selection.status

        with transaction.atomic():
            if action == 'APPROVE':
                selection.status = M4WorkflowStatus.VERIFIED_PENDING_CUSTOMER
                selection.save()

                M4StatusHistory.objects.create(
                    selection=selection,
                    old_status=old_status,
                    new_status=M4WorkflowStatus.VERIFIED_PENDING_CUSTOMER,
                    changed_by=request.user if request.user.is_authenticated else None,
                    remarks=f"Customs Officer granted regulatory clearance ({clearance_id}). Delivered to Customer for final booking sign-off."
                )

                M4Notification.objects.create(
                    recipient=selection.customer,
                    company=selection.company,
                    entity_id=str(selection.id),
                    notification_type='CUSTOMS_CLEARED',
                    message=f"Customs clearance {clearance_id} granted! Your shipment package with {selection.company.name} is ready for final confirmation."
                )

                return Response({
                    'success': True,
                    'status': M4WorkflowStatus.VERIFIED_PENDING_CUSTOMER,
                    'clearance_id': clearance_id,
                    'message': f"Customs clearance granted ({clearance_id})! Delivered to Customer for final confirmation.",
                    'data': QuoteSelectionSerializer(selection).data
                })
            else:
                selection.status = M4WorkflowStatus.AWAITING_CUSTOMER_INFO
                selection.save()

                M4StatusHistory.objects.create(
                    selection=selection,
                    old_status=old_status,
                    new_status=M4WorkflowStatus.AWAITING_CUSTOMER_INFO,
                    changed_by=request.user if request.user.is_authenticated else None,
                    remarks=f"Customs clearance flagged compliance discrepancy: {remarks}"
                )

                return Response({
                    'success': True,
                    'status': M4WorkflowStatus.AWAITING_CUSTOMER_INFO,
                    'message': f"Customs flagged issue: {remarks}",
                    'data': QuoteSelectionSerializer(selection).data
                })


class CustomerFinalDecisionView(views.APIView):
    """
    POST: Customer gives final sign-off (APPROVE / CONFIRM or REJECT)
    after both Company Agent and Customs Officer have approved.
    APPROVE -> Creates confirmed Booking (BOOKING_CONFIRMED).
    REJECT -> Sets CUSTOMER_REJECTED / RESELECT_QUOTE.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, selection_id):
        selection = get_object_or_404(QuoteSelection, pk=selection_id)
        decision = request.data.get('decision', 'APPROVE').upper()
        old_status = selection.status

        with transaction.atomic():
            if decision in ['APPROVE', 'CONFIRM']:
                selection.status = M4WorkflowStatus.BOOKING_CONFIRMED
                selection.save()

                booking, _ = Booking.objects.get_or_create(
                    selection=selection,
                    defaults={
                        'company': selection.company,
                        'customer': selection.customer,
                        'final_price': selection.selected_price,
                        'currency': selection.currency,
                        'status': Booking.BookingStatus.CONFIRMED
                    }
                )

                M4StatusHistory.objects.create(
                    selection=selection,
                    old_status=old_status,
                    new_status=M4WorkflowStatus.BOOKING_CONFIRMED,
                    changed_by=request.user if request.user.is_authenticated else None,
                    remarks=f"Customer gave final confirmation! Booking reference {booking.booking_reference} confirmed."
                )

                M4Notification.objects.create(
                    company=selection.company,
                    entity_id=str(booking.id),
                    notification_type='BOOKING_CONFIRMED',
                    message=f"Customer confirmed booking {booking.booking_reference} with {selection.company.name}!"
                )

                return Response({
                    'success': True,
                    'status': M4WorkflowStatus.BOOKING_CONFIRMED,
                    'booking_reference': booking.booking_reference,
                    'message': f"Booking confirmed! Booking Reference: {booking.booking_reference}",
                    'data': BookingSerializer(booking).data
                })

            else:
                selection.status = M4WorkflowStatus.CUSTOMER_REJECTED
                selection.save()

                M4StatusHistory.objects.create(
                    selection=selection,
                    old_status=old_status,
                    new_status=M4WorkflowStatus.CUSTOMER_REJECTED,
                    changed_by=request.user if request.user.is_authenticated else None,
                    remarks="Customer rejected the verified quote package. Allowed to choose another quote option."
                )

                return Response({
                    'success': True,
                    'status': M4WorkflowStatus.CUSTOMER_REJECTED,
                    'message': "Quote declined by customer. You can now select another quote option."
                })
