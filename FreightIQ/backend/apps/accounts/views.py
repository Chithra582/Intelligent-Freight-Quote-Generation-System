from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.accounts.serializers import CustomTokenObtainPairSerializer, UserSerializer, RegisterSerializer
from core.permissions import IsAdmin

User = get_user_model()


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Issue JWT pair immediately upon registration
        refresh = RefreshToken.for_user(user)
        refresh['user_id'] = str(user.id)
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['full_name'] = user.get_full_name()
        refresh['organization_id'] = str(user.organization_id) if user.organization_id else None

        user_data = UserSerializer(user).data

        return Response({
            'success': True,
            'message': 'User registration successful.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_data
        }, status=status.HTTP_201_CREATED)


class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.all().order_by('-created_at')
