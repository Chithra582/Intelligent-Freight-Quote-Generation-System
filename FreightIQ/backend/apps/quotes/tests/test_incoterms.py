import pytest
from decimal import Decimal
from apps.pricing.cost_engine import CostEngine, INCOTERM_SCOPE, apply_air_weight_breaks


def test_all_seven_incoterms_scope():
    engine = CostEngine()

    # 1. Test EXW (Edge case: produces quote with zero seller cost components)
    exw_res = engine.calculate_cost_breakdown(
        origin_code='INNSA', dest_code='AEJEA', incoterm='EXW',
        container_count=2, pickup_km=25.0
    )
    assert exw_res['incoterm'] == 'EXW'
    assert len(exw_res['components']) == 0
    assert exw_res['total_cost'] == '0.0000'

    # 2. Test FCA: PUH and CCO
    fca_res = engine.calculate_cost_breakdown(
        origin_code='INNSA', dest_code='AEJEA', incoterm='FCA',
        pickup_km=50.0
    )
    fca_codes = [c['code'] for c in fca_res['components']]
    assert 'PUH' in fca_codes
    assert 'CCO' in fca_codes
    assert 'OFR' not in fca_codes

    # 3. Test FOB: Origin charges + documentation
    fob_res = engine.calculate_cost_breakdown(
        origin_code='INNSA', dest_code='AEJEA', incoterm='FOB',
        container_count=2, pickup_km=30.0
    )
    fob_codes = [c['code'] for c in fob_res['components']]
    assert 'THCO' in fob_codes
    assert 'ISPS' in fob_codes
    assert 'DOC' in fob_codes
    assert 'OFR' not in fob_codes

    # 4. Test CFR: Includes Main Freight + BAF
    cfr_res = engine.calculate_cost_breakdown(
        origin_code='INNSA', dest_code='AEJEA', incoterm='CFR',
        container_count=2
    )
    cfr_codes = [c['code'] for c in cfr_res['components']]
    assert 'OFR' in cfr_codes
    assert 'BAF' in cfr_codes
    assert 'INS' not in cfr_codes

    # 5. Test CIF: Includes 110% Marine Cargo Insurance
    cif_res = engine.calculate_cost_breakdown(
        origin_code='INNSA', dest_code='AEJEA', incoterm='CIF',
        container_count=2, declared_value=Decimal('2500000.0000')
    )
    cif_codes = [c['code'] for c in cif_res['components']]
    assert 'INS' in cif_codes
    assert 'THCD' not in cif_codes

    # 6. Test DAP: Destination THC & On-Carriage Haulage
    dap_res = engine.calculate_cost_breakdown(
        origin_code='INNSA', dest_code='AEJEA', incoterm='DAP',
        container_count=2, delivery_km=45.0, declared_value=Decimal('1000000.0000')
    )
    dap_codes = [c['code'] for c in dap_res['components']]
    assert 'THCD' in dap_codes
    assert 'DLH' in dap_codes
    assert 'CCD' not in dap_codes

    # 7. Test DDP: Full door-to-door with destination import customs clearance
    ddp_res = engine.calculate_cost_breakdown(
        origin_code='INNSA', dest_code='AEJEA', incoterm='DDP',
        container_count=2, delivery_km=45.0, declared_value=Decimal('1000000.0000')
    )
    ddp_codes = [c['code'] for c in ddp_res['components']]
    assert 'CCD' in ddp_codes


def test_air_weight_breaks_and_lower_break_rule():
    # 280 kg test from Milestone 2 Spec §4.3:
    # 280 kg @ +100 break (₹195) = ₹54,600
    # Next break (+300 @ ₹180) for 300 kg minimum = ₹54,000 (Lower!)
    amount, break_used, rationale = apply_air_weight_breaks(Decimal('280.0000'))
    assert break_used == "+300"
    assert amount == Decimal('54000.0000')
    assert "Lower-break rule applied" in rationale

    # 50 kg test: +45 break @ ₹220/kg = ₹11,000
    amount_50, break_50, _ = apply_air_weight_breaks(Decimal('50.0000'))
    assert break_50 == "+45"
    assert amount_50 == Decimal('11000.0000')
