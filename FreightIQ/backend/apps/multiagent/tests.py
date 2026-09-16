from django.test import TestCase
from apps.multiagent.orchestrator import MultiAgentCouncilOrchestrator
from core.enums import M4WorkflowStatus


class MultiAgentCouncilTests(TestCase):
    def setUp(self):
        self.orchestrator = MultiAgentCouncilOrchestrator()
        self.sample_enquiry = {
            'shipment_id': 'SHP-1001',
            'customer': 'ABC Electronics Pvt Ltd',
            'origin': 'Chennai, India',
            'destination': 'Rotterdam, Netherlands',
            'cargo': 'Electronics',
            'weight_kg': 5000,
            'container': '40 FT',
            'mode': 'Sea Freight'
        }

    def test_multi_agent_enquiry_deliberation(self):
        """Verify Route, Pricing, Risk, and Carrier agents formulate 3 competitive quotes."""
        result = self.orchestrator.run_enquiry_deliberation(self.sample_enquiry)
        self.assertIn('route_analysis', result)
        self.assertIn('pricing_breakdown', result)
        self.assertIn('risk_assessment', result)
        self.assertEqual(len(result['quote_options']), 3)

        # Verify Carrier IDs
        company_ids = [q['company_id'] for q in result['quote_options']]
        self.assertIn('CMP-101', company_ids)
        self.assertIn('CMP-102', company_ids)
        self.assertIn('CMP-103', company_ids)

    def test_full_cycle_happy_path(self):
        """Verify complete 4-step sequence: Customer -> Company Agent -> Customs -> Customer Confirmation."""
        sim = self.orchestrator.run_full_cycle_simulation(scenario_key='HAPPY_PATH')
        self.assertEqual(sim['final_status'], M4WorkflowStatus.BOOKING_CONFIRMED)
        self.assertIn('BK-2026', sim['booking_reference'])
        self.assertEqual(len(sim['steps']), 5)

    def test_price_revision_scenario(self):
        """Verify Fuel surcharge price revision scenario (₹80,000 -> ₹82,500)."""
        sim = self.orchestrator.run_full_cycle_simulation(scenario_key='PRICE_REVISION')
        self.assertEqual(sim['final_status'], M4WorkflowStatus.BOOKING_CONFIRMED)
        self.assertEqual(sim['final_price'], 82500)

    def test_capacity_rejection_scenario(self):
        """Verify operational rejection when vessel feeder capacity is depleted."""
        sim = self.orchestrator.run_full_cycle_simulation(scenario_key='CAPACITY_REJECT')
        self.assertEqual(sim['final_status'], M4WorkflowStatus.REJECTED)
