from decimal import Decimal, ROUND_HALF_UP

PRECISION_INTERNAL = Decimal('0.0001')
PRECISION_DISPLAY = Decimal('0.01')


def to_decimal(val) -> Decimal:
    """Safely converts any input into a high-precision Decimal."""
    if val is None:
        return Decimal('0.0000')
    if isinstance(val, Decimal):
        return val
    if isinstance(val, (int, str)):
        return Decimal(str(val))
    if isinstance(val, float):
        # Convert float via string representation to avoid float representation artifacts
        return Decimal(str(round(val, 6)))
    return Decimal('0.0000')


def round_money(val, precision=PRECISION_INTERNAL) -> Decimal:
    """Rounds a Decimal value using standard financial ROUND_HALF_UP."""
    d = to_decimal(val)
    return d.quantize(precision, rounding=ROUND_HALF_UP)


def round_display(val) -> Decimal:
    """Rounds a Decimal for currency display (2 decimal places)."""
    return round_money(val, precision=PRECISION_DISPLAY)


def convert_currency(amount: Decimal, fx_rate: Decimal) -> Decimal:
    """Multiplies an amount by the FX rate with exact Decimal arithmetic."""
    amt_d = to_decimal(amount)
    fx_d = to_decimal(fx_rate)
    return round_money(amt_d * fx_d)
