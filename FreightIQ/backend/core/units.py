from decimal import Decimal
from core.money import to_decimal, round_money

KG_PER_LB = Decimal('0.45359237')
CBM_PER_CUFT = Decimal('0.028316846592')
KM_PER_NM = Decimal('1.852')


def lbs_to_kg(lbs) -> Decimal:
    return round_money(to_decimal(lbs) * KG_PER_LB)


def kg_to_lbs(kg) -> Decimal:
    return round_money(to_decimal(kg) / KG_PER_LB)


def cuft_to_cbm(cuft) -> Decimal:
    return round_money(to_decimal(cuft) * CBM_PER_CUFT)


def cbm_to_cuft(cbm) -> Decimal:
    return round_money(to_decimal(cbm) / CBM_PER_CUFT)


def nm_to_km(nm) -> Decimal:
    return round_money(to_decimal(nm) * KM_PER_NM)


def km_to_nm(km) -> Decimal:
    return round_money(to_decimal(km) / KM_PER_NM)


def container_to_teu(container_type: str, count: int = 1) -> Decimal:
    """Calculates TEU (Twenty-foot Equivalent Unit) value."""
    t = str(container_type).upper()
    c = to_decimal(count)
    if '20' in t:
        return c * Decimal('1.0')
    if '40' in t:
        return c * Decimal('2.0')
    if '45' in t:
        return c * Decimal('2.25')
    return c * Decimal('1.0')
