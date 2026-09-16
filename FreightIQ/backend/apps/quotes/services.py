from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone
from apps.shipments.models import Shipment
from apps.routing.models import Route
from apps.quotes.models import FreightQuote, QuoteVersion, QuoteLineItem, QuoteApproval, QuoteDocument
from apps.pricing.cost_engine import CostEngine
from apps.quotes.margin_policy import resolve_margin_policy
from apps.quotes.approval_engine import evaluate_quote_approval
from apps.quotes.pdf_generator import generate_quote_pdf
from core.money import to_decimal, round_money
from core.enums import QuoteStatus, UserRole
from core.exceptions import MarginFloorBreachException, BusinessLogicException


class QuoteService:
    @staticmethod
    def create_quote(
        shipment: Shipment,
        route: Route = None,
        margin_pct: Decimal = Decimal('15.000'),
        target_currency: str = 'USD',
        created_by = None
    ) -> FreightQuote:
        """
        Creates a new FreightQuote and its Version 1 row.
        """
        if not route:
            # Pick recommended or top route
            route = shipment.routes.filter(is_recommended=True).first() or shipment.routes.first()

        cost_engine = CostEngine()
        cost_res = cost_engine.calculate_cost_breakdown(
            origin_code=shipment.origin_code,
            dest_code=shipment.destination_code,
            mode=shipment.mode,
            load_type=shipment.load_type,
            incoterm=shipment.incoterm,
            container_type=shipment.container_type,
            container_count=shipment.container_count,
            chargeable_units=shipment.chargeable_units,
            carrier_code=route.carrier.code if route and route.carrier else None,
            declared_value=shipment.declared_value or to_decimal(0),
            target_currency=target_currency
        )

        total_buy_cost = to_decimal(cost_res['total_buy_cost'])
        lane_key = f"{shipment.origin_code}-{shipment.destination_code}"
        customer_tier = shipment.customer.tier if shipment.customer else 'STANDARD'

        policy = resolve_margin_policy(
            lane_key=lane_key,
            customer_tier=customer_tier,
            cargo_type='HAZ' if shipment.is_hazardous else ('TEMP' if shipment.is_temperature_controlled else 'GEN')
        )

        # Margin application
        margin_pct_d = to_decimal(margin_pct)
        sell_rate = round_money(total_buy_cost * (Decimal('1.0') + (margin_pct_d / Decimal('100.0'))))
        margin_amount = round_money(sell_rate - total_buy_cost)

        # Win probability estimation
        win_prob = Decimal('0.8500')
        if margin_pct_d > policy['target_pct']:
            win_prob = max(Decimal('0.4000'), win_prob - ((margin_pct_d - policy['target_pct']) * Decimal('0.03')))
        elif margin_pct_d < policy['target_pct']:
            win_prob = min(Decimal('0.9800'), win_prob + ((policy['target_pct'] - margin_pct_d) * Decimal('0.02')))

        # Approval check
        approval_eval = evaluate_quote_approval(
            margin_pct=margin_pct_d,
            floor_pct=policy['floor_pct'],
            total_quote_value=sell_rate,
            is_predicted_rate=cost_res['is_predicted']
        )

        initial_status = QuoteStatus.PENDING_APPROVAL if approval_eval['requires_approval'] else QuoteStatus.DRAFT

        quote = FreightQuote.objects.create(
            shipment=shipment,
            customer=shipment.customer,
            current_version=1,
            status=initial_status,
            created_by=created_by
        )

        valid_until_dt = timezone.now() + timedelta(days=7)

        quote_ver = QuoteVersion.objects.create(
            quote=quote,
            version=1,
            route=route,
            carrier=route.carrier if route else None,
            currency=target_currency,
            fx_rate=Decimal('1.000000'),
            total_cost=total_buy_cost,
            margin_pct=margin_pct_d,
            margin_amount=margin_amount,
            final_quote=sell_rate,
            transit_days=route.transit_days if route else 10,
            risk_score=to_decimal(route.route_risk_score if route else 0.15),
            win_probability=win_prob,
            valid_until=valid_until_dt,
            model_versions={'transit_model': 'v1.4-lgbm', 'rate_model': 'v1.2-elasticnet', 'pricing_engine': 'v2.1'},
            data_as_of={'port_data': '2026-08-14T12:00:00Z', 'carrier_tariffs': '2026-08-14T00:00:00Z'},
            assumptions=[
                "Rates are valid for 7 calendar days from issuance.",
                "Subject to standard terminal handling and bunker fuel adjustments.",
                "Customs duties and statutory port taxes payable as per actuals."
            ],
            rationale={
                'margin_resolution': f"Applied {margin_pct_d}% margin against {policy['scope']} floor of {policy['floor_pct']}%.",
                'carrier_rationale': route.rationale if route else 'Standard direct carrier service.'
            },
            cost_breakdown=cost_res,
            created_by=created_by
        )

        # Create line items
        for comp in cost_res['components']:
            if comp['included_in_buyer_quote']:
                base_amt = to_decimal(comp['amount'])
                sell_amt = round_money(base_amt * (Decimal('1.0') + (margin_pct_d / Decimal('100.0'))))
                QuoteLineItem.objects.create(
                    quote_version=quote_ver,
                    component_code=comp['code'],
                    description=comp['name'],
                    amount=sell_amt,
                    currency=target_currency,
                    is_included_in_sell_rate=True
                )

        # Create Approval record if required
        if approval_eval['requires_approval']:
            for breach in approval_eval['breach_reasons']:
                QuoteApproval.objects.create(
                    quote_version=quote_ver,
                    requested_by=created_by or shipment.created_by,
                    approver_role=approval_eval['approver_role'],
                    threshold_breached=breach,
                    decision=QuoteApproval.Decision.PENDING
                )

        # Generate PDF Quotation
        try:
            pdf_path = generate_quote_pdf(quote_ver)
            QuoteDocument.objects.create(
                quote_version=quote_ver,
                document_type='PDF',
                file_name=f"{quote.quote_number}_v1.pdf",
                file_path=pdf_path
            )
        except Exception as e:
            print(f"PDF Generation warning: {e}")

        return quote

    @staticmethod
    def adjust_margin(
        quote: FreightQuote,
        new_margin_pct: Decimal,
        user,
        reason: str = ''
    ) -> QuoteVersion:
        """
        Creates a new immutable version of the quote with the adjusted margin.
        """
        latest_ver = quote.versions.filter(version=quote.current_version).first()
        if not latest_ver:
            raise BusinessLogicException("Cannot adjust a quote with no existing versions.")

        # Check authority: only Admin or Pricing Manager can bypass margin floor
        shipment = quote.shipment
        lane_key = f"{shipment.origin_code}-{shipment.destination_code}"
        customer_tier = shipment.customer.tier if shipment.customer else 'STANDARD'
        policy = resolve_margin_policy(lane_key=lane_key, customer_tier=customer_tier)

        new_margin_d = to_decimal(new_margin_pct)
        if new_margin_d < policy['floor_pct'] and user.role not in (UserRole.ADMIN, UserRole.PRICING_MANAGER, UserRole.SENIOR_BROKER):
            raise MarginFloorBreachException(
                f"Submitted margin ({new_margin_d}%) is below mandatory policy floor ({policy['floor_pct']}%). Senior Broker or Pricing Manager authority required."
            )

        new_version_num = quote.current_version + 1
        total_buy_cost = latest_ver.total_cost
        new_sell_rate = round_money(total_buy_cost * (Decimal('1.0') + (new_margin_d / Decimal('100.0'))))
        new_margin_amount = round_money(new_sell_rate - total_buy_cost)

        approval_eval = evaluate_quote_approval(
            margin_pct=new_margin_d,
            floor_pct=policy['floor_pct'],
            total_quote_value=new_sell_rate,
            is_predicted_rate=latest_ver.cost_breakdown.get('is_predicted', False)
        )

        new_status = QuoteStatus.PENDING_APPROVAL if approval_eval['requires_approval'] else QuoteStatus.DRAFT

        new_ver = QuoteVersion.objects.create(
            quote=quote,
            version=new_version_num,
            route=latest_ver.route,
            carrier=latest_ver.carrier,
            currency=latest_ver.currency,
            fx_rate=latest_ver.fx_rate,
            total_cost=total_buy_cost,
            margin_pct=new_margin_d,
            margin_amount=new_margin_amount,
            final_quote=new_sell_rate,
            transit_days=latest_ver.transit_days,
            risk_score=latest_ver.risk_score,
            win_probability=latest_ver.win_probability,
            valid_until=latest_ver.valid_until,
            model_versions=latest_ver.model_versions,
            data_as_of=latest_ver.data_as_of,
            assumptions=latest_ver.assumptions,
            rationale={
                'adjustment_reason': reason or 'Manual broker margin adjustment.',
                'policy_floor': str(policy['floor_pct'])
            },
            cost_breakdown=latest_ver.cost_breakdown,
            created_by=user
        )

        # Clone line items with new sell amount
        for old_item in latest_ver.line_items.all():
            comp_cost = to_decimal(old_item.amount) / (Decimal('1.0') + (latest_ver.margin_pct / Decimal('100.0')))
            new_item_sell = round_money(comp_cost * (Decimal('1.0') + (new_margin_d / Decimal('100.0'))))
            QuoteLineItem.objects.create(
                quote_version=new_ver,
                component_code=old_item.component_code,
                description=old_item.description,
                amount=new_item_sell,
                currency=old_item.currency,
                is_included_in_sell_rate=old_item.is_included_in_sell_rate
            )

        if approval_eval['requires_approval']:
            for breach in approval_eval['breach_reasons']:
                QuoteApproval.objects.create(
                    quote_version=new_ver,
                    requested_by=user,
                    approver_role=approval_eval['approver_role'],
                    threshold_breached=breach,
                    decision=QuoteApproval.Decision.PENDING
                )

        quote.current_version = new_version_num
        quote.status = new_status
        quote.save(update_fields=['current_version', 'status', 'updated_at'])

        try:
            pdf_path = generate_quote_pdf(new_ver)
            QuoteDocument.objects.create(
                quote_version=new_ver,
                document_type='PDF',
                file_name=f"{quote.quote_number}_v{new_version_num}.pdf",
                file_path=pdf_path
            )
        except Exception:
            pass

        return new_ver
