from typing import Dict, Any, Optional

# Baseline lane rate medians for M1 placeholder
BASELINE_RATES: Dict[str, Dict[str, float]] = {
    'APAC_MEASA_OCEAN_20GP': {'per_unit': 1200.0, 'min': 800.0},
    'APAC_MEASA_OCEAN_40HC': {'per_unit': 1900.0, 'min': 1200.0},
    'APAC_AMER_OCEAN_20GP': {'per_unit': 1800.0, 'min': 1000.0},
    'APAC_AMER_OCEAN_40HC': {'per_unit': 2700.0, 'min': 1500.0},
    'APAC_EMEA_OCEAN_20GP': {'per_unit': 1600.0, 'min': 1100.0},
    'APAC_EMEA_OCEAN_40HC': {'per_unit': 2400.0, 'min': 1400.0},
    'MEASA_EMEA_OCEAN_20GP': {'per_unit': 1400.0, 'min': 950.0},
    'MEASA_EMEA_OCEAN_40HC': {'per_unit': 2100.0, 'min': 1300.0},

    # LCL per Revenue Ton
    'DEFAULT_OCEAN_LCL': {'per_unit': 85.0, 'min': 150.0},
    # Air per KG
    'DEFAULT_AIR': {'per_unit': 4.50, 'min': 120.0},
    'DEFAULT_EXPRESS_AIR': {'per_unit': 8.50, 'min': 180.0},
    'DEFAULT_GROUND_RAIL': {'per_unit': 0.18, 'min': 80.0},
}

FLAT_UPLIFT = 0.35  # 35% stand-in for fuel, terminal handling, documentation and margin in M1


def compute_indicative_total(
    origin_region: str,
    dest_region: str,
    mode: str,
    load_type: str,
    chargeable_info: Dict[str, Any],
    distance_val: float = 1000.0,
    container_type: str = '40HC',
    currency: str = 'USD'
) -> Dict[str, Any]:
    """
    Computes indicative baseline total for Milestone 1 Live Estimate.
    Returns amount, currency, is_indicative=True, and cost breakdown.
    """
    mode_u = mode.upper()
    load_u = load_type.upper() if load_type else 'FCL'
    basis = chargeable_info.get('basis', 'CHARGEABLE_KG')
    units = float(chargeable_info.get('units', 1))

    rate_data = None
    if mode_u == 'OCEAN' and (load_u == 'LCL' or basis == 'REVENUE_TON'):
        rate_data = BASELINE_RATES.get(f"{origin_region}_{dest_region}_OCEAN_LCL", BASELINE_RATES['DEFAULT_OCEAN_LCL'])
    elif mode_u == 'AIR':
        rate_data = BASELINE_RATES.get(f"{origin_region}_{dest_region}_AIR", BASELINE_RATES['DEFAULT_AIR'])
    elif mode_u == 'EXPRESS_AIR':
        rate_data = BASELINE_RATES.get(f"{origin_region}_{dest_region}_EXPRESS_AIR", BASELINE_RATES['DEFAULT_EXPRESS_AIR'])
    elif mode_u == 'GROUND_RAIL':
        rate_data = BASELINE_RATES.get(f"{origin_region}_{dest_region}_GROUND_RAIL", BASELINE_RATES['DEFAULT_GROUND_RAIL'])
    else:
        lookup_key = f"{origin_region}_{dest_region}_{mode_u}_{container_type}"
        rate_data = BASELINE_RATES.get(lookup_key, {'per_unit': 2200.0 if '40' in container_type else 1500.0, 'min': 1000.0})

    per_unit_rate = rate_data['per_unit']
    min_charge = rate_data['min']

    if basis == 'PER_CONTAINER':
        base_freight = per_unit_rate * units
    elif basis == 'REVENUE_TON':
        base_freight = max(per_unit_rate * units, min_charge)
    else:  # CHARGEABLE_KG
        if mode_u == 'GROUND_RAIL':
            base_freight = max((per_unit_rate * distance_val * (units / 1000.0)), min_charge)
        else:
            base_freight = max(per_unit_rate * units, min_charge)

    total_amount = base_freight * (1.0 + FLAT_UPLIFT)

    return {
        'amount': round(total_amount, 2),
        'currency': currency,
        'is_indicative': True,
        'basis': basis,
        'units': units,
        'rate_per_unit': per_unit_rate,
        'base_freight': round(base_freight, 2),
        'estimated_surcharges_and_margin': round(base_freight * FLAT_UPLIFT, 2),
        'note': 'Indicative estimate derived from standard trade corridor rate tables.'
    }
