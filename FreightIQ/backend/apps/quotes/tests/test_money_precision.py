import pytest
from decimal import Decimal
from core.money import to_decimal, round_money, round_display, convert_currency


def test_decimal_conversions_and_zero_floats():
    d1 = to_decimal(1500)
    assert isinstance(d1, Decimal)
    assert d1 == Decimal('1500.0000')

    d2 = to_decimal('2450.7589')
    assert isinstance(d2, Decimal)
    assert d2 == Decimal('2450.7589')

    # Rounding Half-Up precision
    d3 = round_money(Decimal('123.45678'))
    assert d3 == Decimal('123.4568')

    d4 = round_display(Decimal('123.4568'))
    assert d4 == Decimal('123.46')


def test_currency_conversion():
    usd_amount = Decimal('1000.0000')
    fx_rate_inr = Decimal('83.500000')
    inr_amount = convert_currency(usd_amount, fx_rate_inr)
    assert inr_amount == Decimal('83500.0000')
    assert isinstance(inr_amount, Decimal)
