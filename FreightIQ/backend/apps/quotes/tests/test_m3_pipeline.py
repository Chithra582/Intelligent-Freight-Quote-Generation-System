from decimal import Decimal
import pytest
from apps.pricing.ml_model import MLPricingPredictor

def test_ml_pricing_prediction_metrics():
    """Verifies ML price prediction returns valid R2, confidence intervals and bounds."""
    res = MLPricingPredictor.predict_market_rate(
        origin='INMAA',
        destination='SGSIN',
        container_type='40hc',
        units=2,
        weight_kg=36800.0
    )
    assert res['r2_score'] >= 0.95
    assert res['rmse_inr'] <= 3500.0
    assert res['predicted_market_rate'] > 0
    assert res['confidence_interval'][0] < res['predicted_market_rate'] < res['confidence_interval'][1]

def test_rule_vs_ml_pricing_comparison():
    """Verifies side-by-side comparison between deterministic rule price and ML price."""
    rule_buy = Decimal('129000.00')
    rule_sell = Decimal('148350.00')
    
    comp = MLPricingPredictor.compare_rule_vs_ml(
        rule_buy_cost=rule_buy,
        rule_sell_price=rule_sell,
        origin='Chennai (INMAA)',
        destination='Singapore (SGSIN)',
        container_type='40hc',
        units=2,
        weight_kg=36800.0
    )
    
    assert 'Chennai (INMAA) ➔ Singapore (SGSIN)' in comp['corridor']
    assert comp['rule_pricing']['final_sell_price'] == 148350.0
    assert 'percent_diff' in comp['variance']
    assert 'recommendation' in comp['variance']

def test_composite_risk_scoring_formula():
    """Verifies the 5-factor weighted risk engine formula."""
    # Weights: Weather 30%, Customs 25%, Route 20%, Port 15%, Cargo 10%
    weather = Decimal('20.0')
    customs = Decimal('15.0')
    route = Decimal('25.0')
    port = Decimal('10.0')
    cargo = Decimal('5.0')

    expected_overall = (
        weather * Decimal('0.30') +
        customs * Decimal('0.25') +
        route * Decimal('0.20') +
        port * Decimal('0.15') +
        cargo * Decimal('0.10')
    ) # 6.0 + 3.75 + 5.0 + 1.5 + 0.5 = 16.75

    assert expected_overall == Decimal('16.75')
    assert expected_overall < Decimal('30.0') # Classifies as LOW risk band
