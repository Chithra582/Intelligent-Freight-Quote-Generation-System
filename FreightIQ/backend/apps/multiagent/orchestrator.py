"""
Multi-Agent Council Orchestrator
Coordinates asynchronous multi-turn dialogues between agents, manages state transitions,
and interfaces with the Milestone 4 database models.
"""

import random
from datetime import datetime
from typing import Dict, Any, List, Optional
from core.enums import M4WorkflowStatus
from apps.multiagent.agents import (
    RouteIntelligenceAgent,
    PricingMLAgent,
    RiskComplianceAgent,
    CarrierCompanyAgent,
    CompanyVerificationAgent,
    CustomsComplianceAgent,
    CustomerShipperAgent
)


class MultiAgentCouncilOrchestrator:
    """Orchestrates the multi-agent council deliberation and the 4-step approval lifecycle."""

    def __init__(self):
        self.route_agent = RouteIntelligenceAgent()
        self.pricing_agent = PricingMLAgent()
        self.risk_agent = RiskComplianceAgent()

        # Multi-carrier digital desks
        self.carrier_agents = [
            CarrierCompanyAgent(company_id='CMP-101', company_name='OceanLink Logistics', base_discount=0.06, rating=4.9, speed_advantage_days=4),
            CarrierCompanyAgent(company_id='CMP-102', company_name='GlobalSea Freight', base_discount=0.0, rating=4.7, speed_advantage_days=0),
            CarrierCompanyAgent(company_id='CMP-103', company_name='FastRoute Cargo', base_discount=0.15, rating=4.8, speed_advantage_days=8),
        ]

        self.verification_agent = CompanyVerificationAgent(agent_code='AGT-204', company_name='GlobalSea Freight')
        self.customs_agent = CustomsComplianceAgent()
        self.customer_agent = CustomerShipperAgent(customer_name='ABC Electronics Pvt Ltd')

    def run_enquiry_deliberation(self, enquiry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Stage 1: Customer submits enquiry -> Multi-Agent Council deliberates -> Multi-Carrier Quotes generated.
        """
        transcript: List[Dict[str, Any]] = []

        origin = enquiry.get('origin', 'Chennai, India')
        destination = enquiry.get('destination', 'Rotterdam, Netherlands')
        mode = enquiry.get('mode', 'Sea Freight')
        cargo = enquiry.get('cargo', 'Electronics')
        weight_kg = float(enquiry.get('weight_kg', 5000))
        container_type = enquiry.get('container', '40 FT')

        # 1. Route Agent
        route_res = self.route_agent.analyze_corridor(origin, destination, mode)
        transcript.extend(self.route_agent.logs[-1:])

        # 2. Pricing Agent
        pricing_res = self.pricing_agent.calculate_base_rate(
            distance_nm=route_res['distance_nm'],
            weight_kg=weight_kg,
            container_type=container_type,
            cargo=cargo
        )
        transcript.extend(self.pricing_agent.logs[-1:])

        # 3. Risk Agent
        risk_res = self.risk_agent.assess_voyage_risk(route_res, cargo)
        transcript.extend(self.risk_agent.logs[-1:])

        # 4. Multi-Carrier Bidding Agents
        quote_options = []
        for c_agent in self.carrier_agents:
            q = c_agent.formulate_quote(
                shipment_params=enquiry,
                pricing_baseline=pricing_res['recommended_sell_rate'],
                transit_baseline_days=route_res['transit_days']
            )
            quote_options.append(q)
            transcript.extend(c_agent.logs[-1:])

        return {
            'enquiry': enquiry,
            'route_analysis': route_res,
            'pricing_breakdown': pricing_res,
            'risk_assessment': risk_res,
            'quote_options': quote_options,
            'transcript': transcript
        }

    def run_operational_verification(
        self,
        selection_data: Dict[str, Any],
        scenario_key: Optional[str] = None,
        scenario_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Stage 2: Particular Company Agent verifies the shipment.
        """
        chosen_override = scenario_override or scenario_key
        res = self.verification_agent.verify_request(selection_data, scenario_override=chosen_override)
        return {
            'verification_result': res,
            'logs': self.verification_agent.logs[-1:]
        }

    def run_customs_clearance(self, shipment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Stage 3: Customs Officer reviews and grants regulatory clearance.
        """
        res = self.customs_agent.review_customs(shipment_data)
        return {
            'customs_result': res,
            'logs': self.customs_agent.logs[-1:]
        }

    def run_full_cycle_simulation(self, scenario_key: str = 'HAPPY_PATH') -> Dict[str, Any]:
        """
        Simulates the entire 4-stage sequential lifecycle from end to end:
        1. Customer Enquiry & Quote generation (SHP-1001)
        2. Customer selects GlobalSea Freight (QT-5002)
        3. Particular Company Agent AGT-204 verifies
        4. Customs Officer authorizes regulatory clearance
        5. Package returned to Customer -> Customer approves -> Confirmed Booking BK-2026-10045!
        """
        simulation_steps: List[Dict[str, Any]] = []

        # Reset agent logs for fresh simulation
        self.route_agent.logs = []
        self.pricing_agent.logs = []
        self.risk_agent.logs = []
        for c in self.carrier_agents:
            c.logs = []
        self.verification_agent.logs = []
        self.customs_agent.logs = []
        self.customer_agent.logs = []

        # 1. Customer Enquiry & AI Council Deliberation
        enquiry = {
            'shipment_id': 'SHP-1001',
            'customer': 'ABC Electronics Pvt Ltd',
            'origin': 'Chennai, India (INMAA)',
            'destination': 'Rotterdam, Netherlands (NLRTM)',
            'cargo': 'Electronics',
            'weight_kg': 5000,
            'volume_cbm': 12.0,
            'mode': 'Sea Freight',
            'container': '40 FT',
            'incoterm': 'CIF'
        }

        delib_result = self.run_enquiry_deliberation(enquiry)
        simulation_steps.append({
            'step_number': 1,
            'step_name': 'Customer Enquiry & Multi-Agent Deliberation',
            'actor': 'AI Multi-Agent Council',
            'status': M4WorkflowStatus.QUOTE_OPTIONS_AVAILABLE,
            'description': 'Route Agent optimized corridor (8,240 NM). Pricing Agent modeled BAF fuel surcharge. 3 Carrier Agents formulated competitive quote options.',
            'quote_options': delib_result['quote_options'],
            'logs': delib_result['transcript']
        })

        # 2. Customer selects preferred quote (Page 14 scenario: GlobalSea Freight QT-5002)
        selected_quote = self.customer_agent.evaluate_options(delib_result['quote_options'], priority='Lowest Price')
        simulation_steps.append({
            'step_number': 2,
            'step_name': 'Customer Quote Selection',
            'actor': 'Customer (ABC Electronics Pvt Ltd)',
            'status': M4WorkflowStatus.PENDING_COMPANY_VERIFICATION,
            'description': f"Customer selected {selected_quote['company_name']} ({selected_quote['quote_number']}) at {selected_quote['price_formatted']}. Dispatched exclusively to {selected_quote['company_name']} agent desk.",
            'selected_quote': selected_quote,
            'logs': self.customer_agent.logs[-1:]
        })

        # 3. Particular Company Agent Verifies (AGT-204)
        v_override = None
        if scenario_key == 'PRICE_REVISION':
            v_override = 'PRICE_REVISION'
        elif scenario_key == 'CAPACITY_REJECT':
            v_override = 'CAPACITY_REJECT'
        elif scenario_key == 'MISSING_DOCS':
            v_override = 'MISSING_DOCS'

        verification_result = self.run_operational_verification(selected_quote, scenario_override=v_override)
        v_data = verification_result['verification_result']

        if v_data['action'] == 'MODIFY':
            # Price Revision Path
            simulation_steps.append({
                'step_number': 3,
                'step_name': 'Company Agent Price Modification',
                'actor': f"Company Agent ({v_data['agent_code']})",
                'status': M4WorkflowStatus.REVISION_PENDING_CUSTOMER,
                'description': f"Agent identified bunker fuel cost increase. Revised price from ₹{v_data['price_revision']['original_price']:,} to ₹{v_data['price_revision']['revised_price']:,}. Sent revision to Customer.",
                'revision': v_data['price_revision'],
                'checklist': v_data['checklist'],
                'logs': verification_result['logs']
            })

            # Customer reviews revision
            customer_accepts = self.customer_agent.evaluate_revision(v_data['price_revision'])
            simulation_steps.append({
                'step_number': 4,
                'step_name': 'Customer Revision Review & Acceptance',
                'actor': 'Customer (ABC Electronics Pvt Ltd)',
                'status': M4WorkflowStatus.PENDING_CUSTOMS_APPROVAL if customer_accepts else M4WorkflowStatus.CUSTOMER_REJECTED,
                'description': f"Customer accepted revised price of ₹{v_data['price_revision']['revised_price']:,}. Forwarding to Customs Officer desk.",
                'accepted': customer_accepts,
                'logs': self.customer_agent.logs[-1:]
            })

            if not customer_accepts:
                return {
                    'scenario': scenario_key,
                    'final_status': M4WorkflowStatus.CUSTOMER_REJECTED,
                    'steps': simulation_steps
                }

        elif v_data['action'] == 'REJECT':
            simulation_steps.append({
                'step_number': 3,
                'step_name': 'Company Agent Capacity Rejection',
                'actor': f"Company Agent ({v_data['agent_code']})",
                'status': M4WorkflowStatus.REJECTED,
                'description': f"Verification rejected: {v_data['rejection_reason']}. Customer notified to select an alternative quote.",
                'rejection_reason': v_data['rejection_reason'],
                'checklist': v_data['checklist'],
                'logs': verification_result['logs']
            })
            return {
                'scenario': scenario_key,
                'final_status': M4WorkflowStatus.REJECTED,
                'steps': simulation_steps
            }

        elif v_data['action'] == 'REQUEST_INFO':
            simulation_steps.append({
                'step_number': 3,
                'step_name': 'Company Agent Requests Information',
                'actor': f"Company Agent ({v_data['agent_code']})",
                'status': M4WorkflowStatus.AWAITING_CUSTOMER_INFO,
                'description': f"Missing documentation flagged: {v_data['info_requested']}.",
                'info_requested': v_data['info_requested'],
                'checklist': v_data['checklist'],
                'logs': verification_result['logs']
            })
            return {
                'scenario': scenario_key,
                'final_status': M4WorkflowStatus.AWAITING_CUSTOMER_INFO,
                'steps': simulation_steps
            }

        else:
            # Standard Happy Path Approval by Company Agent
            simulation_steps.append({
                'step_number': 3,
                'step_name': 'Company Agent Operational Approval',
                'actor': f"Company Agent ({v_data['agent_code']})",
                'status': M4WorkflowStatus.PENDING_CUSTOMS_APPROVAL,
                'description': f"All 9 operational checklist items passed! Forwarded automatically to Customs Officer desk for regulatory clearance.",
                'checklist': v_data['checklist'],
                'logs': verification_result['logs']
            })

        # 4. Customs Officer Review & Approval
        customs_res = self.run_customs_clearance(enquiry)
        c_data = customs_res['customs_result']
        simulation_steps.append({
            'step_number': len(simulation_steps) + 1,
            'step_name': 'Customs Officer Regulatory Clearance',
            'actor': 'Customs Officer (Officer R. Verma)',
            'status': M4WorkflowStatus.VERIFIED_PENDING_CUSTOMER,
            'description': f"Customs inspection complete. ICEGATE shipping bill validated. Regulatory Clearance {c_data['clearance_id']} issued. Verified package delivered to Customer.",
            'clearance_id': c_data['clearance_id'],
            'hs_code': c_data['hs_code'],
            'checks': c_data['checks'],
            'logs': customs_res['logs']
        })

        # 5. Customer Final Review & Booking Confirmation
        final_price = 82500 if scenario_key == 'PRICE_REVISION' else selected_quote['price']
        booking_reference = 'BK-2026-10045'

        simulation_steps.append({
            'step_number': len(simulation_steps) + 1,
            'step_name': 'Customer Final Booking Confirmation',
            'actor': 'Customer (ABC Electronics Pvt Ltd)',
            'status': M4WorkflowStatus.BOOKING_CONFIRMED,
            'description': f"Customer reviewed full verified & customs-cleared package and APPROVED! Confirmed Booking Reference issued: {booking_reference}.",
            'booking_reference': booking_reference,
            'final_price': final_price,
            'final_price_formatted': f"₹{final_price:,.0f}",
            'logs': [{
                'agent_id': 'agent-customer',
                'agent_name': 'Customer Shipper Agent',
                'role': 'Shipper Final Confirmation',
                'stage': 'Booking Confirmation',
                'thought': f"Verified commercial terms & customs clearance {c_data['clearance_id']} accepted. Confirmed booking generated: {booking_reference}.",
                'confidence': 1.0,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }]
        })

        return {
            'scenario': scenario_key,
            'final_status': M4WorkflowStatus.BOOKING_CONFIRMED,
            'booking_reference': booking_reference,
            'final_price': final_price,
            'steps': simulation_steps
        }
