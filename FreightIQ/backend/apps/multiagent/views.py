"""
Multi-Agent Council API Views
Exposes endpoints for multi-agent council deliberation, operational verification,
customs compliance reviews, customer confirmation, and scenario simulations.
"""

from rest_framework import views, permissions, status
from rest_framework.response import Response
from apps.multiagent.orchestrator import MultiAgentCouncilOrchestrator
from apps.quotes.m4_models import (
    FreightCompany,
    CompanyQuoteOption,
    QuoteSelection,
    VerificationRequest,
    QuoteRevision,
    Booking,
    M4StatusHistory
)
from core.enums import M4WorkflowStatus


class ActiveAgentsListView(views.APIView):
    """GET: Return all registered cognitive agents in the FreightIQ council."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        orchestrator = MultiAgentCouncilOrchestrator()
        agents = [
            {
                'id': orchestrator.route_agent.agent_id,
                'name': orchestrator.route_agent.name,
                'role': orchestrator.route_agent.role,
                'icon': orchestrator.route_agent.icon,
                'color': orchestrator.route_agent.color,
                'type': 'Core Analytical Agent',
                'status': 'ACTIVE',
                'capabilities': ['Nautical Routing', 'Port Congestion Buffer', 'Corridor Optimization']
            },
            {
                'id': orchestrator.pricing_agent.agent_id,
                'name': orchestrator.pricing_agent.name,
                'role': orchestrator.pricing_agent.role,
                'icon': orchestrator.pricing_agent.icon,
                'color': orchestrator.pricing_agent.color,
                'type': 'Core Analytical Agent',
                'status': 'ACTIVE',
                'capabilities': ['Dynamic Linehaul', 'BAF Fuel Surcharge', 'Tariff Margin Floor (>12%)']
            },
            {
                'id': orchestrator.risk_agent.agent_id,
                'name': orchestrator.risk_agent.name,
                'role': orchestrator.risk_agent.role,
                'icon': orchestrator.risk_agent.icon,
                'color': orchestrator.risk_agent.color,
                'type': 'Core Analytical Agent',
                'status': 'ACTIVE',
                'capabilities': ['Ocean Meteorology', 'Red Sea / Suez Chokepoint Alerts', 'Customs Readiness Score']
            },
            {
                'id': 'agent-carriers',
                'name': 'Forwarder Bidding Desks (OceanLink, GlobalSea, FastRoute)',
                'role': 'Autonomous Commercial Quotation Desks',
                'icon': 'Building2',
                'color': 'text-emerald-400',
                'type': 'Multi-Carrier Desks',
                'status': 'ACTIVE',
                'capabilities': ['Eligible Forwarder Bidding', 'Equipment Availability', 'Dynamic Transit Matrix']
            },
            {
                'id': orchestrator.verification_agent.agent_id,
                'name': orchestrator.verification_agent.name,
                'role': orchestrator.verification_agent.role,
                'icon': orchestrator.verification_agent.icon,
                'color': orchestrator.verification_agent.color,
                'type': 'Operational Verification Agent',
                'status': 'ACTIVE',
                'capabilities': ['9-Point Operational Checklist', 'Discrepancy Detection', 'Surcharge Verification']
            },
            {
                'id': orchestrator.customs_agent.agent_id,
                'name': orchestrator.customs_agent.name,
                'role': orchestrator.customs_agent.role,
                'icon': orchestrator.customs_agent.icon,
                'color': orchestrator.customs_agent.color,
                'type': 'Statutory Regulatory Officer',
                'status': 'ACTIVE',
                'capabilities': ['HS Code Harmonization', 'ICEGATE Validation', 'Customs Clearance Authorization']
            },
            {
                'id': orchestrator.customer_agent.agent_id,
                'name': orchestrator.customer_agent.name,
                'role': orchestrator.customer_agent.role,
                'icon': orchestrator.customer_agent.icon,
                'color': orchestrator.customer_agent.color,
                'type': 'Customer Shipper Representative',
                'status': 'ACTIVE',
                'capabilities': ['Quote Comparison & Selection', 'Revision Tolerance Review', 'Booking Sign-Off']
            }
        ]
        return Response({'success': True, 'count': len(agents), 'agents': agents})


class DeliberationView(views.APIView):
    """POST: Run multi-agent council deliberation on a shipment enquiry."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        enquiry = request.data or {}
        orchestrator = MultiAgentCouncilOrchestrator()
        result = orchestrator.run_enquiry_deliberation(enquiry)
        return Response({'success': True, 'data': result})


class VerificationAgentView(views.APIView):
    """POST: Company agent operational verification with 9-point checklist."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        selection_data = request.data.get('selection_data', {})
        scenario_key = request.data.get('scenario_key')
        orchestrator = MultiAgentCouncilOrchestrator()
        result = orchestrator.run_operational_verification(selection_data, scenario_key=scenario_key)
        return Response({'success': True, 'data': result})


class CustomsAgentView(views.APIView):
    """POST: Customs officer reviews documents and grants clearance."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        shipment_data = request.data.get('shipment_data', {})
        orchestrator = MultiAgentCouncilOrchestrator()
        result = orchestrator.run_customs_clearance(shipment_data)
        return Response({'success': True, 'data': result})


class FullCycleSimulationView(views.APIView):
    """POST: Run end-to-end multi-agent scenario simulation with complete step-by-step logs."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        scenario_key = request.data.get('scenario_key', 'HAPPY_PATH')
        orchestrator = MultiAgentCouncilOrchestrator()
        result = orchestrator.run_full_cycle_simulation(scenario_key=scenario_key)
        return Response({'success': True, 'data': result})


class PlatformObservabilityView(views.APIView):
    """
    GET: Omniscient platform monitoring for the Platform Admin.
    Provides complete visibility of selections, agent verifications, customs reviews,
    revisions, and confirmed bookings across all freight companies.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        companies = FreightCompany.objects.all()
        selections = QuoteSelection.objects.all().select_related('quote_option', 'company', 'customer')[:20]
        verifications = VerificationRequest.objects.all().select_related('selection', 'assigned_agent')[:20]
        revisions = QuoteRevision.objects.all().select_related('selection')[:20]
        bookings = Booking.objects.all().select_related('company', 'customer')[:20]
        audit_logs = M4StatusHistory.objects.all().select_related('selection')[:30]

        return Response({
            'success': True,
            'summary': {
                'total_companies': companies.count(),
                'eligible_companies': companies.filter(is_eligible=True, status=FreightCompany.CompanyStatus.APPROVED).count(),
                'active_selections': selections.count(),
                'pending_verifications': verifications.filter(status=M4WorkflowStatus.PENDING_COMPANY_VERIFICATION).count(),
                'pending_customs': selections.filter(status=M4WorkflowStatus.PENDING_CUSTOMS_APPROVAL).count(),
                'total_bookings': bookings.count(),
                'total_revisions': revisions.count()
            },
            'recent_selections': [
                {
                    'id': str(s.id),
                    'selection_number': s.selection_number,
                    'company_name': s.company.name,
                    'company_id': s.company.company_id,
                    'customer_name': s.customer_name,
                    'selected_price': float(s.selected_price),
                    'status': s.status,
                    'created_at': s.created_at.strftime('%b %d, %H:%M')
                } for s in selections
            ],
            'recent_bookings': [
                {
                    'id': str(b.id),
                    'booking_reference': b.booking_reference,
                    'company_name': b.company.name,
                    'company_id': b.company.company_id,
                    'final_price': float(b.final_price),
                    'status': b.status,
                    'confirmed_at': b.confirmed_at.strftime('%b %d, %H:%M')
                } for b in bookings
            ],
            'audit_trail': [
                {
                    'selection_number': log.selection.selection_number,
                    'old_status': log.old_status,
                    'new_status': log.new_status,
                    'remarks': log.remarks,
                    'timestamp': log.created_at.strftime('%b %d, %H:%M:%S')
                } for log in audit_logs
            ]
        })
