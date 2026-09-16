import pytest
from decimal import Decimal
from apps.quotes.approval_engine import evaluate_quote_approvals
from apps.quotes.margin_policy import resolve_margin_policy, apply_margin_to_cost


def test_margin_policy_hierarchical_resolution():
    # Lane specific policy
    lane_pol = resolve_margin_policy(lane_key='INNSA-AEJEA')
    assert lane_pol['scope'] == 'LANE'
    assert lane_pol['floor_pct'] == Decimal('12.000')

    # Global default fallback
    global_pol = resolve_margin_policy()
    assert global_pol['scope'] == 'GLOBAL'
    assert global_pol['floor_pct'] == Decimal('12.000')


def test_margin_floor_suppression_and_enforcement():
    # Cost = ₹3,61,992, requested margin = 8.0% (below 12.0% floor)
    cost = Decimal('361992.0000')
    res = apply_margin_to_cost(total_cost=cost, requested_margin_pct=Decimal('8.0000'))
    
    assert res['margin_suppressed'] is True
    assert res['applied_margin_pct'] == '12.000'
    assert res['recommended_margin_pct'] == '8.0000'
    assert "suppressed and enforced" in res['suppression_reason']


def test_all_six_approval_rules():
    floor = Decimal('12.0000')

    # Rule 1: Deep discount (> 5% below floor -> PRICING_MANAGER)
    r1 = evaluate_quote_approvals(
        applied_margin_pct=Decimal('6.0000'), # 6.0 points below 12.0%
        floor_pct=floor,
        quote_value=Decimal('500000.0000')
    )
    assert r1['requires_approval'] is True
    assert r1['approver_role'] == 'PRICING_MANAGER'
    assert any(a['rule_index'] == 1 for a in r1['approvals_required'])

    # Rule 2: Minor discount (<= 5% below floor -> SENIOR_BROKER)
    r2 = evaluate_quote_approvals(
        applied_margin_pct=Decimal('9.5000'), # 2.5 points below 12.0%
        floor_pct=floor,
        quote_value=Decimal('500000.0000')
    )
    assert r2['requires_approval'] is True
    assert r2['approver_role'] == 'SENIOR_BROKER'
    assert any(a['rule_index'] == 2 for a in r2['approvals_required'])

    # Rule 3: High value quote (> ₹40,00,000 -> PRICING_MANAGER)
    r3 = evaluate_quote_approvals(
        applied_margin_pct=Decimal('15.0000'),
        floor_pct=floor,
        quote_value=Decimal('5500000.0000')
    )
    assert r3['requires_approval'] is True
    assert r3['approver_role'] == 'PRICING_MANAGER'
    assert any(a['rule_index'] == 3 for a in r3['approvals_required'])

    # Rule 4: Predicted component -> SENIOR_BROKER
    r4 = evaluate_quote_approvals(
        applied_margin_pct=Decimal('15.0000'),
        floor_pct=floor,
        quote_value=Decimal('200000.0000'),
        has_predicted_component=True
    )
    assert r4['requires_approval'] is True
    assert r4['approver_role'] == 'SENIOR_BROKER'
    assert any(a['rule_index'] == 4 for a in r4['approvals_required'])

    # Rule 5: New customer with no credit profile -> SENIOR_BROKER
    r5 = evaluate_quote_approvals(
        applied_margin_pct=Decimal('15.0000'),
        floor_pct=floor,
        quote_value=Decimal('200000.0000'),
        has_credit_profile=False
    )
    assert r5['requires_approval'] is True
    assert any(a['rule_index'] == 5 for a in r5['approvals_required'])

    # Rule 6: Rate card expiring before quote validity -> SENIOR_BROKER
    r6 = evaluate_quote_approvals(
        applied_margin_pct=Decimal('15.0000'),
        floor_pct=floor,
        quote_value=Decimal('200000.0000'),
        rate_card_expires_early=True
    )
    assert r6['requires_approval'] is True
    assert any(a['rule_index'] == 6 for a in r6['approvals_required'])
