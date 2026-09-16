from django.urls import path
from apps.quotes.views import (
    QuoteListCreateView, QuoteDetailView, QuoteAdjustMarginView,
    QuoteApproveView, QuoteRejectView, QuoteIssueView, QuoteAcceptView,
    QuoteDeclineView, QuoteDocumentDownloadView, ApprovalQueueListView,
    MarginPolicyListView, ApprovalRuleListView
)

from apps.quotes.m4_views import (
    CompanyListCreateView,
    CompanyApprovalView,
    CompanyAgentManagementView,
    MultiCompanyQuoteGenerationView,
    QuoteSelectionView,
    VerificationActionView,
    CustomsClearanceActionView,
    CustomerFinalDecisionView,
    RevisionResponseView,
    BookingListView
)

urlpatterns = [
    path('', QuoteListCreateView.as_view(), name='quote_list_create'),
    path('approvals/queue/', ApprovalQueueListView.as_view(), name='quote_approval_queue'),
    path('margin-policies/', MarginPolicyListView.as_view(), name='quote_margin_policies'),
    path('approval-rules/', ApprovalRuleListView.as_view(), name='quote_approval_rules'),
    path('<uuid:pk>/', QuoteDetailView.as_view(), name='quote_detail'),
    path('<uuid:pk>/margin/', QuoteAdjustMarginView.as_view(), name='quote_adjust_margin'),
    path('<uuid:pk>/approve/', QuoteApproveView.as_view(), name='quote_approve'),
    path('<uuid:pk>/reject/', QuoteRejectView.as_view(), name='quote_reject'),
    path('<uuid:pk>/issue/', QuoteIssueView.as_view(), name='quote_issue'),
    path('<uuid:pk>/accept/', QuoteAcceptView.as_view(), name='quote_accept'),
    path('<uuid:pk>/decline/', QuoteDeclineView.as_view(), name='quote_decline'),
    path('<uuid:pk>/document/', QuoteDocumentDownloadView.as_view(), name='quote_document_download'),

    # Milestone 4 Routes
    path('m4/companies/', CompanyListCreateView.as_view(), name='m4_companies_list_create'),
    path('m4/companies/<uuid:pk>/approval/', CompanyApprovalView.as_view(), name='m4_company_approval'),
    path('m4/companies/<str:company_id>/agents/', CompanyAgentManagementView.as_view(), name='m4_company_agents'),
    path('m4/quote-options/', MultiCompanyQuoteGenerationView.as_view(), name='m4_quote_options'),
    path('m4/selections/', QuoteSelectionView.as_view(), name='m4_quote_selections'),
    path('m4/selections/<uuid:selection_id>/verify/', VerificationActionView.as_view(), name='m4_verify_action'),
    path('m4/selections/<uuid:selection_id>/customs-clearance/', CustomsClearanceActionView.as_view(), name='m4_customs_clearance'),
    path('m4/selections/<uuid:selection_id>/customer-decision/', CustomerFinalDecisionView.as_view(), name='m4_customer_decision'),
    path('m4/revisions/<uuid:revision_id>/respond/', RevisionResponseView.as_view(), name='m4_revision_respond'),
    path('m4/bookings/', BookingListView.as_view(), name='m4_bookings_list'),
]

