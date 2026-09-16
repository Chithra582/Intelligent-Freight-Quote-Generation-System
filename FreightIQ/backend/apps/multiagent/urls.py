from django.urls import path
from apps.multiagent.views import (
    ActiveAgentsListView,
    DeliberationView,
    VerificationAgentView,
    CustomsAgentView,
    FullCycleSimulationView,
    PlatformObservabilityView
)

urlpatterns = [
    path('agents/', ActiveAgentsListView.as_view(), name='multiagent_agents_list'),
    path('deliberate/', DeliberationView.as_view(), name='multiagent_deliberate'),
    path('verify/', VerificationAgentView.as_view(), name='multiagent_verify'),
    path('customs-clearance/', CustomsAgentView.as_view(), name='multiagent_customs'),
    path('simulate/', FullCycleSimulationView.as_view(), name='multiagent_simulate'),
    path('observability/', PlatformObservabilityView.as_view(), name='multiagent_observability'),
]
