from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.accounts.views import CustomLoginView, RegisterView, CurrentUserProfileView, UserListView

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='auth_login'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('me/', CurrentUserProfileView.as_view(), name='auth_me'),
    path('users/', UserListView.as_view(), name='auth_users'),
]
