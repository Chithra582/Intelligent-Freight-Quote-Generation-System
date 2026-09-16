from decimal import Decimal
from typing import Dict, Any, List, Optional
from core.enums import UserRole
from core.money import to_decimal, round_money


def evaluate_quote_approvals(
    applied_margin_pct: Decimal = None,
    margin_pct: Decimal = None,
    floor_pct: Decimal = Decimal('12.0000'),
    quote_value: Decimal = None,
    total_quote_value: Decimal = None,
    has_predicted_component: bool = False,
    is_predicted_rate: bool = False,
    has_credit_profile: bool = True,
    rate_card_expires_early: bool = False
) -> Dict[str, Any]:
    """
    Evaluates the 6 Approval Rules defined in Milestone 2 Spec §5.4:
    Order 1: Margin below floor by > 5 percentage points -> PRICING_MANAGER
    Order 2: Margin below floor by <= 5 percentage points -> SENIOR_BROKER
    Order 3: Quote value above high-value threshold (> ₹40,00,000 INR / $50,000 USD) -> PRICING_MANAGER
    Order 4: Any component sourced as PREDICTED -> SENIOR_BROKER
    Order 5: New customer with no credit profile -> SENIOR_BROKER
    Order 6: Rate card expires before quote validity ends -> SENIOR_BROKER
    """
    # Normalize argument aliases
    actual_margin = applied_margin_pct if applied_margin_pct is not None else (margin_pct if margin_pct is not None else Decimal('15.0000'))
    actual_value = quote_value if quote_value is not None else (total_quote_value if total_quote_value is not None else Decimal('0.0000'))
    actual_predicted = has_predicted_component or is_predicted_rate

    margin_d = to_decimal(actual_margin)
    floor_d = to_decimal(floor_pct)
    val_d = to_decimal(actual_value)

    approvals_required: List[Dict[str, Any]] = []
    breach_reasons: List[str] = []

    # Rule 1 & 2: Margin Below Floor
    if margin_d < floor_d:
        gap = round_money(floor_d - margin_d)
        if gap > Decimal('5.0000'):
            reason = f"Deep discount: Applied margin ({margin_d}%) is {gap} percentage points below policy floor ({floor_d}%)."
            approvals_required.append({
                'rule_index': 1,
                'rule_name': 'Deep discount — below floor by > 5 points',
                'approver_role': UserRole.PRICING_MANAGER,
                'breach_reason': reason,
                'gap_points': str(gap),
                'is_blocking': True
            })
            breach_reasons.append(reason)
        else:
            reason = f"Margin below floor: Applied margin ({margin_d}%) is {gap} percentage points below policy floor ({floor_d}%)."
            approvals_required.append({
                'rule_index': 2,
                'rule_name': 'Margin below floor by up to 5 points',
                'approver_role': UserRole.SENIOR_BROKER,
                'breach_reason': reason,
                'gap_points': str(gap),
                'is_blocking': True
            })
            breach_reasons.append(reason)

    # Rule 3: High-Value Threshold (> ₹40,00,000 / $50,000)
    if val_d > Decimal('4000000.0000'):
        reason = f"High value quote (₹{val_d:,.2f}) exceeds standard commercial authorization limit."
        approvals_required.append({
            'rule_index': 3,
            'rule_name': 'Quote value above high-value threshold',
            'approver_role': UserRole.PRICING_MANAGER,
            'breach_reason': reason,
            'quote_value': str(val_d),
            'is_blocking': True
        })
        breach_reasons.append(reason)

    # Rule 4: Uncontracted PREDICTED component
    if actual_predicted:
        reason = "Quotation incorporates uncontracted PREDICTED market rate component."
        approvals_required.append({
            'rule_index': 4,
            'rule_name': 'Any component sourced as PREDICTED',
            'approver_role': UserRole.SENIOR_BROKER,
            'breach_reason': reason,
            'is_blocking': True
        })
        breach_reasons.append(reason)

    # Rule 5: New customer with no credit profile
    if not has_credit_profile:
        reason = "New customer account with unestablished credit limit profile."
        approvals_required.append({
            'rule_index': 5,
            'rule_name': 'New customer with no credit profile',
            'approver_role': UserRole.SENIOR_BROKER,
            'breach_reason': reason,
            'is_blocking': True
        })
        breach_reasons.append(reason)

    # Rule 6: Rate card expires before quote validity
    if rate_card_expires_early:
        reason = "Carrier rate card expiry date precedes the 7-day quote validity window."
        approvals_required.append({
            'rule_index': 6,
            'rule_name': 'Rate card expires before quote validity ends',
            'approver_role': UserRole.SENIOR_BROKER,
            'breach_reason': reason,
            'is_blocking': True
        })
        breach_reasons.append(reason)

    requires_approval = len(approvals_required) > 0
    highest_approver_role = UserRole.PRICING_MANAGER if any(a['approver_role'] == UserRole.PRICING_MANAGER for a in approvals_required) else (UserRole.SENIOR_BROKER if requires_approval else None)

    return {
        'requires_approval': requires_approval,
        'is_auto_approved': not requires_approval,
        'approver_role': highest_approver_role,
        'approvals_required': approvals_required,
        'breach_reasons': breach_reasons,
        'reason': breach_reasons[0] if breach_reasons else None,
        'approval_count': len(approvals_required)
    }


# Backwards compatibility alias for services.py and test suites
evaluate_quote_approval = evaluate_quote_approvals
