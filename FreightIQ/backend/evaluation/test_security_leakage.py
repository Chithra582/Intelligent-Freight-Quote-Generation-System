import os
import sys
import django
from decimal import Decimal

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.quotes.models import FreightQuote, QuoteVersion
from apps.quotes.serializers import CustomerQuoteVersionSerializer, BrokerQuoteVersionSerializer
from apps.accounts.models import User


def test_customer_portal_cost_leakage():
    """
    CRITICAL SECURITY CHECK:
    Asserts that CustomerQuoteVersionSerializer strictly excludes cost, margin, and internal buy rates.
    """
    print("=" * 70)
    print("SECURITY EVALUATION: CUSTOMER DATA LEAKAGE & CONFIDENTIALITY CHECK")
    print("=" * 70)

    # Inspect Customer serializer fields directly
    forbidden_keys = {'total_cost', 'margin_pct', 'margin_amount', 'carrier_buy_rate', 'cost_breakdown'}
    customer_fields = set(CustomerQuoteVersionSerializer().fields.keys())

    leaked = customer_fields.intersection(forbidden_keys)

    print(f"Customer Serializer Fields: {list(customer_fields)}")
    print(f"Forbidden Confidential Keys: {list(forbidden_keys)}")
    print(f"Detected Leaked Fields: {list(leaked)}")

    is_secure = len(leaked) == 0
    if is_secure:
        print("\n>>> RESULT: PASSED (Customer Serializer is 100% Secure & Isolated!) <<<")
    else:
        print(f"\n>>> RESULT: FAILED - Security breach! Leaked keys: {leaked} <<<")

    print("=" * 70)
    assert is_secure, f"Security breach: Customer serializer leaked forbidden keys: {leaked}"



if __name__ == '__main__':
    test_customer_portal_cost_leakage()
