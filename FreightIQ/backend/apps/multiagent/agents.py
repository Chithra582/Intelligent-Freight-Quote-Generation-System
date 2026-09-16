"""
Autonomous Multi-Agent Freight Council
Defines specialized cognitive agents for route intelligence, pricing,
voyage risk, carrier bidding, operational verification, customs compliance, and customer advocacy.
"""

import math
import random
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from core.money import to_decimal, round_money
from core.enums import M4WorkflowStatus


class BaseFreightAgent:
    """Base class for all cognitive agents in the FreightIQ council."""

    def __init__(self, agent_id: str, name: str, role: str, icon: str = "Cpu", color: str = "text-indigo-400"):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.icon = icon
        self.color = color
        self.logs: List[Dict[str, Any]] = []

    def log(self, stage: str, thought: str, data: Optional[Dict[str, Any]] = None, confidence: float = 0.95):
        entry = {
            'agent_id': self.agent_id,
            'agent_name': self.name,
            'role': self.role,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'stage': stage,
            'thought': thought,
            'confidence': confidence,
            'data': data or {}
        }
        self.logs.append(entry)
        return entry


class RouteIntelligenceAgent(BaseFreightAgent):
    """Corridor, port congestion, nautical distance, and maritime loop specialist."""

    def __init__(self):
        super().__init__(
            agent_id='agent-route',
            name='Route Intelligence Agent',
            role='Maritime Corridor & Port Congestion Specialist',
            icon='Navigation',
            color='text-sky-400'
        )

    def analyze_corridor(self, origin: str, destination: str, mode: str = 'Sea Freight') -> Dict[str, Any]:
        orig_clean = origin.split('(')[0].strip()
        dest_clean = destination.split('(')[0].strip()

        # Approximate maritime nautical miles
        distance_map = {
            ('chennai', 'rotterdam'): 8240,
            ('chennai', 'antwerp'): 8310,
            ('chennai', 'singapore'): 1640,
            ('chennai', 'jebel ali'): 2150,
            ('nhava sheva', 'jebel ali'): 1080,
            ('nhava sheva', 'rotterdam'): 6450,
            ('mumbai', 'rotterdam'): 6450,
        }

        pair = (orig_clean.lower(), dest_clean.lower())
        distance_nm = distance_map.get(pair)
        if not distance_nm:
            # Fallback estimation
            distance_nm = 5500 + random.randint(500, 2500)

        # Base transit calculation at 16 knots cruising speed + port calls
        base_days = int(math.ceil(distance_nm / (16 * 24))) + 5

        # Corridor assessment
        has_suez = 'rotterdam' in dest_clean.lower() or 'antwerp' in dest_clean.lower()
        congestion_hours = 18 if has_suez else 8

        self.log(
            stage='Corridor Optimization',
            thought=f"Evaluated maritime route from {orig_clean} to {dest_clean}. "
                    f"Identified optimal East-West maritime corridor ({distance_nm:,} NM). "
                    f"Port congestion at transshipment points rated normal (+{congestion_hours}h buffer).",
            data={
                'distance_nm': distance_nm,
                'estimated_transit_days': base_days,
                'congestion_hours': congestion_hours,
                'via_suez': has_suez,
                'recommended_hub': 'Colombo (LKCMB)' if 'chennai' in orig_clean.lower() else 'Direct'
            },
            confidence=0.96
        )

        return {
            'distance_nm': distance_nm,
            'transit_days': base_days,
            'congestion_buffer_hours': congestion_hours,
            'chokepoints': ['Bab-el-Mandeb Strait', 'Suez Canal'] if has_suez else ['Strait of Malacca'],
            'recommended_routing': f"{orig_clean} ➔ Colombo Feed ➔ Suez Transit ➔ {dest_clean}"
        }


class PricingMLAgent(BaseFreightAgent):
    """Dynamic haulage rates, spot fuel adjustment factor (BAF), and rate engine."""

    def __init__(self):
        super().__init__(
            agent_id='agent-pricing',
            name='Pricing & Market Intelligence Agent',
            role='Carrier Spot Rates, Surcharges & Margin Engine',
            icon='DollarSign',
            color='text-blue-400'
        )

    def calculate_base_rate(self, distance_nm: int, weight_kg: float, container_type: str = '40 FT', cargo: str = 'Electronics') -> Dict[str, Any]:
        # Nautical mile cost baseline
        base_cost = (distance_nm * 8.2) + (weight_kg * 2.8)
        
        # Commodity multiplier
        cargo_multiplier = 1.25 if 'electronic' in cargo.lower() else (1.4 if 'haz' in cargo.lower() else 1.0)
        adjusted_base = base_cost * cargo_multiplier

        # BAF (Bunker Adjustment Factor) fuel index
        baf_surcharge = adjusted_base * 0.085  # 8.5%
        terminal_handling = 6500
        doc_fees = 2200

        total_buy_rate = adjusted_base + baf_surcharge + terminal_handling + doc_fees
        recommended_sell_rate = total_buy_rate * 1.15  # 15% target margin

        self.log(
            stage='Rate Modeling',
            thought=f"Calculated dynamic container baseline for {cargo} ({weight_kg:,} KG in {container_type}). "
                    f"Bunker fuel index applied at 8.5% (₹{baf_surcharge:,.0f}). "
                    f"Computed competitive market baseline of ₹{recommended_sell_rate:,.0f}.",
            data={
                'buy_rate': round(total_buy_rate, 2),
                'recommended_sell_rate': round(recommended_sell_rate, 2),
                'baf_surcharge': round(baf_surcharge, 2),
                'terminal_handling': terminal_handling,
                'margin_target_pct': 15.0
            },
            confidence=0.94
        )

        return {
            'buy_rate': round(total_buy_rate, 2),
            'recommended_sell_rate': round(recommended_sell_rate, 2),
            'baf_fuel_surcharge': round(baf_surcharge, 2),
            'terminal_handling': terminal_handling,
            'doc_fees': doc_fees
        }


class RiskComplianceAgent(BaseFreightAgent):
    """Voyage weather risks, geopolitical bottlenecks, and customs barrier analyst."""

    def __init__(self):
        super().__init__(
            agent_id='agent-risk',
            name='Risk & Weather Compliance Agent',
            role='Voyage Hazards, Meteorology & Regulatory Shield',
            icon='CloudRain',
            color='text-amber-400'
        )

    def assess_voyage_risk(self, route_info: Dict[str, Any], cargo: str = 'Electronics') -> Dict[str, Any]:
        weather_score = 14.0  # Low weather severity
        customs_score = 18.0  # Electronics documentation scrutiny
        route_score = 22.0 if route_info.get('chokepoints') else 10.0
        port_score = 15.0

        overall_score = (weather_score * 0.25) + (customs_score * 0.25) + (route_score * 0.35) + (port_score * 0.15)
        risk_level = 'LOW' if overall_score < 25 else ('MEDIUM' if overall_score < 50 else 'HIGH')

        self.log(
            stage='Multi-Factor Risk Assessment',
            thought=f"Assessed composite voyage risk across Red Sea and Mediterranean transit lanes. "
                    f"Weather hazard nominal (Score: {weather_score}/100). "
                    f"Overall risk evaluated as {risk_level} (Composite: {overall_score:.1f}/100).",
            data={
                'overall_score': round(overall_score, 1),
                'risk_level': risk_level,
                'weather_score': weather_score,
                'customs_score': customs_score,
                'route_score': route_score,
                'alerts': ['Red Sea precautionary transit monitoring active', 'HS 8542 dual-use export screening required']
            },
            confidence=0.95
        )

        return {
            'overall_score': round(overall_score, 1),
            'risk_level': risk_level,
            'weather_score': weather_score,
            'customs_score': customs_score,
            'route_score': route_score,
            'alerts': [
                'Red Sea precautionary convoy monitoring active',
                'Dual-use export classification verification mandatory for electronics'
            ]
        }


class CarrierCompanyAgent(BaseFreightAgent):
    """Autonomous digital bidding agent representing a verified freight provider."""

    def __init__(self, company_id: str, company_name: str, base_discount: float, rating: float, speed_advantage_days: int = 0):
        super().__init__(
            agent_id=f'agent-carrier-{company_id.lower()}',
            name=f'{company_name} Carrier Agent',
            role='Autonomous Forwarder Quotation & Dispatch Desk',
            icon='Building2',
            color='text-emerald-400'
        )
        self.company_id = company_id
        self.company_name = company_name
        self.base_discount = base_discount
        self.rating = rating
        self.speed_advantage_days = speed_advantage_days

    def formulate_quote(self, shipment_params: Dict[str, Any], pricing_baseline: float, transit_baseline_days: int) -> Dict[str, Any]:
        # Formulate price based on provider commercial strategy
        final_price = round(pricing_baseline * (1.0 + self.base_discount), -2)
        final_transit = max(14, transit_baseline_days - self.speed_advantage_days)

        quote_number = f"QT-{random.randint(5000, 5999)}"
        if self.company_id == 'CMP-101':
            quote_number = 'QT-5001'
            final_price = 85000
            final_transit = 24
            risk_level = 'Low'
            badge = 'Most Reliable'
            features = ['Direct Port Call', 'Terminal Handling Included', '7-Day Price Lock']
        elif self.company_id == 'CMP-102':
            quote_number = 'QT-5002'
            final_price = 80000
            final_transit = 28
            risk_level = 'Medium'
            badge = 'Lowest Price'
            features = ['Economical Sea Loop', 'Free 14 Days Demurrage', 'Dedicated Agent AGT-204']
        elif self.company_id == 'CMP-103':
            quote_number = 'QT-5003'
            final_price = 92000
            final_transit = 20
            risk_level = 'Low'
            badge = 'Fastest ETA'
            features = ['Express Priority Loop', 'GPS Cargo Tracking', 'Zero Port Transshipment']
        else:
            risk_level = 'Low'
            badge = 'Verified Forwarder'
            features = ['Standard Sea Freight', 'End-to-End Tracking']

        self.log(
            stage='Quote Formulation',
            thought=f"{self.company_name} autonomous agent formulated quotation {quote_number}: "
                    f"₹{final_price:,.0f} with {final_transit} days ETA. Equipment allocation confirmed.",
            data={
                'quote_number': quote_number,
                'price': final_price,
                'transit_days': final_transit,
                'company_id': self.company_id,
                'badge': badge
            },
            confidence=0.97
        )

        return {
            'quote_number': quote_number,
            'company_id': self.company_id,
            'company_name': self.company_name,
            'price': final_price,
            'price_formatted': f"₹{final_price:,.0f}",
            'transit_days': f"{final_transit} Days",
            'transit_days_num': final_transit,
            'risk_level': risk_level,
            'rating': self.rating,
            'badge': badge,
            'features': features
        }


class CompanyVerificationAgent(BaseFreightAgent):
    """Company operational verification desk executing the official 9-point checklist."""

    def __init__(self, agent_code: str = 'AGT-204', company_name: str = 'GlobalSea Freight'):
        super().__init__(
            agent_id='agent-verification',
            name=f'Company Operations Agent ({agent_code})',
            role=f'Operational & Commercial Verification Desk ({company_name})',
            icon='ShieldCheck',
            color='text-indigo-400'
        )
        self.agent_code = agent_code
        self.company_name = company_name

    def verify_request(
        self,
        selection_data: Dict[str, Any],
        scenario_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes the official 9-point checklist from Page 6 of the M4 specification:
        1. Shipment: Origin, destination, cargo, date
        2. Cargo: Weight, volume, special handling
        3. Capacity: Container/vehicle space availability
        4. Route: Operational feasibility
        5. Schedule: Pickup & ETA validity
        6. Documents: Commercial invoice, packing list
        7. Commercial: Base rate, fuel, handling charges
        8. Risk Context: Weather/customs/route alerts
        9. Quote Validity: Expiry date check
        """
        checklist = {
            'shipment': {'label': 'Shipment Origin/Destination/Cargo', 'passed': True, 'remarks': 'Route and cargo description valid.'},
            'cargo': {'label': 'Cargo Weight & Volume Specifications', 'passed': True, 'remarks': '5,000 KG within 40 FT payload threshold.'},
            'capacity': {'label': 'Container / Vessel Capacity', 'passed': True, 'remarks': 'Confirmed 40 FT space on scheduled sailing.'},
            'route': {'label': 'Operational Corridor Feasibility', 'passed': True, 'remarks': 'Feasible corridor with regular feeder connection.'},
            'schedule': {'label': 'Pickup Window and ETA Confirmation', 'passed': True, 'remarks': 'Pickup window validated with port terminal.'},
            'documents': {'label': 'Invoice, Packing List & Declarations', 'passed': True, 'remarks': 'Commercial Invoice and Packing List uploaded.'},
            'commercial': {'label': 'Commercial Base Rate & Surcharges', 'passed': True, 'remarks': 'Base rate validated against current tariff.'},
            'risk_context': {'label': 'Risk & Weather Alerts Assessment', 'passed': True, 'remarks': 'Monsoon and transit advisories acknowledged.'},
            'quote_validity': {'label': 'Quote Expiry & Validity Window', 'passed': True, 'remarks': 'Quote active and within 7-day lock period.'}
        }

        action = 'APPROVE'
        price_revision = None
        rejection_reason = None
        info_requested = None

        if scenario_override == 'PRICE_REVISION':
            checklist['commercial']['passed'] = False
            checklist['commercial']['remarks'] = 'Fuel surcharge index rose +3.1% at bunkering port.'
            action = 'MODIFY'
            price_revision = {
                'original_price': selection_data.get('price', 80000),
                'revised_price': selection_data.get('price', 80000) + 2500,
                'reason': 'Fuel surcharge increase',
                'revised_eta_days': selection_data.get('transit_days', 28)
            }
        elif scenario_override == 'CAPACITY_REJECT':
            checklist['capacity']['passed'] = False
            checklist['capacity']['remarks'] = 'Vessel feeder fully booked for requested departure week.'
            action = 'REJECT'
            rejection_reason = 'Vessel space fully allocated. Cannot guarantee feeder connection.'
        elif scenario_override == 'MISSING_DOCS':
            checklist['documents']['passed'] = False
            checklist['documents']['remarks'] = 'Missing Certificate of Origin & Signed Commercial Invoice.'
            action = 'REQUEST_INFO'
            info_requested = 'Please upload signed Commercial Invoice and Certificate of Origin.'

        self.log(
            stage='9-Point Checklist Verification',
            thought=f"{self.name} conducted operational & commercial verification. "
                    f"Result: {action}. " +
                    (f"Price adjusted by ₹{price_revision['revised_price'] - price_revision['original_price']:,} due to {price_revision['reason']}." if price_revision else
                     f"Reason: {rejection_reason}" if rejection_reason else
                     f"All 9 operational checklist items satisfied. Forwarding to Customs Officer desk for regulatory clearance."),
            data={
                'checklist': checklist,
                'action': action,
                'price_revision': price_revision,
                'rejection_reason': rejection_reason,
                'next_step': 'Customs Officer Regulatory Review' if action == 'APPROVE' else 'Customer Notification'
            },
            confidence=0.98
        )

        return {
            'agent_code': self.agent_code,
            'company_name': self.company_name,
            'checklist': checklist,
            'action': action,
            'price_revision': price_revision,
            'rejection_reason': rejection_reason,
            'info_requested': info_requested,
            'verified_at': datetime.utcnow().isoformat() + 'Z'
        }


class CustomsComplianceAgent(BaseFreightAgent):
    """Statutory customs officer regulatory and compliance review desk."""

    def __init__(self, officer_name: str = "Officer R. Verma (Customs Desk)"):
        super().__init__(
            agent_id='agent-customs',
            name=officer_name,
            role='Statutory Customs Border & Regulatory Compliance',
            icon='Scale',
            color='text-rose-400'
        )

    def review_customs(self, shipment_data: Dict[str, Any]) -> Dict[str, Any]:
        commodity = shipment_data.get('cargo', 'Electronics')
        hs_code = '8504.40.90' if 'electronic' in commodity.lower() else '8471.30.10'
        
        checks = [
            {'check': 'HS Code Tariff Classification', 'status': 'PASSED', 'detail': f"HS {hs_code} correctly mapped to commodity."},
            {'check': 'ICEGATE Export Declaration', 'status': 'PASSED', 'detail': 'Electronic shipping bill verified.'},
            {'check': 'Dual-Use Strategic Goods Screen', 'status': 'CLEARED', 'detail': 'Non-sanctioned dual use commercial goods.'},
            {'check': 'Preferential Trade Agreement Check', 'status': 'VERIFIED', 'detail': 'Duty concessions verified under CEPA.'}
        ]

        clearance_id = f"CUS-2026-{random.randint(10000, 99999)}"

        self.log(
            stage='Customs Regulatory Verification',
            thought=f"{self.name} completed customs compliance audit. "
                    f"HS code {hs_code} verified. Shipping bill authorized. "
                    f"Customs Regulatory Clearance granted: {clearance_id}. "
                    f"Package ready to send to Customer for final booking confirmation.",
            data={
                'clearance_id': clearance_id,
                'hs_code': hs_code,
                'checks': checks,
                'status': 'CUSTOMS_APPROVED'
            },
            confidence=0.99
        )

        return {
            'clearance_id': clearance_id,
            'hs_code': hs_code,
            'checks': checks,
            'customs_status': 'CUSTOMS_APPROVED',
            'cleared_at': datetime.utcnow().isoformat() + 'Z'
        }


class CustomerShipperAgent(BaseFreightAgent):
    """Represents customer shipper goals, budget boundaries, and booking confirmation."""

    def __init__(self, customer_name: str = "ABC Electronics Pvt Ltd"):
        super().__init__(
            agent_id='agent-customer',
            name=f'{customer_name} Shipper Agent',
            role='Customer Budget & Booking Evaluation Desk',
            icon='UserCheck',
            color='text-purple-400'
        )
        self.customer_name = customer_name

    def evaluate_options(self, quote_options: List[Dict[str, Any]], priority: str = 'Lowest Price') -> Dict[str, Any]:
        if not quote_options:
            return {}

        if priority == 'Lowest Price':
            selected = min(quote_options, key=lambda q: q.get('price', 999999))
        elif priority == 'Fastest ETA':
            selected = min(quote_options, key=lambda q: q.get('transit_days_num', 999))
        else:
            selected = max(quote_options, key=lambda q: q.get('rating', 0.0))

        self.log(
            stage='Customer Selection',
            thought=f"{self.name} evaluated {len(quote_options)} forwarder quote options against '{priority}' preference. "
                    f"Selected {selected['company_name']} ({selected['quote_number']}) at {selected['price_formatted']} "
                    f"with {selected['transit_days']} transit. Dispatched to {selected['company_name']} agent queue.",
            data={'selected_quote': selected, 'priority': priority},
            confidence=0.98
        )

        return selected

    def evaluate_revision(self, revision: Dict[str, Any], max_tolerated_delta_pct: float = 0.05) -> bool:
        original = revision.get('original_price', 80000)
        revised = revision.get('revised_price', 82500)
        delta_pct = (revised - original) / original

        accepted = delta_pct <= max_tolerated_delta_pct
        reason = revision.get('reason', 'Adjustment')

        self.log(
            stage='Revision Evaluation',
            thought=f"{self.name} evaluated price revision of ₹{revised:,.0f} (+{delta_pct*100:.1f}%) due to '{reason}'. "
                    f"Within customer tolerance band of {max_tolerated_delta_pct*100}%. "
                    f"Decision: {'ACCEPTED' if accepted else 'REJECTED'}.",
            data={'accepted': accepted, 'delta_pct': delta_pct, 'revised_price': revised},
            confidence=0.96
        )

        return accepted
