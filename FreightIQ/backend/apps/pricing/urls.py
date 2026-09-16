from django.urls import path
from apps.pricing.views import (
    RateCardListView, RateCardDetailView, SurchargeListView,
    RateHistoryListView, CostBreakdownView, RateCardImportView,
    InstantQuotePricingView, RateConfigView, RetrainPricingMLView
)

urlpatterns = [
    path('instant-quote/', InstantQuotePricingView.as_view(), name='pricing_instant_quote'),
    path('rate-config/', RateConfigView.as_view(), name='pricing_rate_config'),
    path('retrain-ml/', RetrainPricingMLView.as_view(), name='pricing_retrain_ml'),
    path('rate-cards/', RateCardListView.as_view(), name='pricing_rate_cards'),
    path('rate-cards/import/', RateCardImportView.as_view(), name='pricing_rate_card_import'),
    path('rate-cards/<uuid:pk>/', RateCardDetailView.as_view(), name='pricing_rate_card_detail'),
    path('surcharges/', SurchargeListView.as_view(), name='pricing_surcharges'),
    path('cost-breakdown/', CostBreakdownView.as_view(), name='pricing_cost_breakdown'),
    path('rate-history/', RateHistoryListView.as_view(), name='pricing_rate_history'),
]

