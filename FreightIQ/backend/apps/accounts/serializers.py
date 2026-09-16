from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from apps.accounts.models import Organization
from core.enums import UserRole

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_id'] = str(user.id)
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.get_full_name()
        token['organization_id'] = str(user.organization_id) if user.organization_id else None
        token['customer_id'] = str(user.customer_id) if user.customer_id else None
        return token

    def validate(self, attrs):
        # Support email or username in the login form
        username_or_email = attrs.get('username')
        request_obj = self.context.get('request')
        requested_role = request_obj.data.get('role') if (request_obj and hasattr(request_obj, 'data')) else None

        if username_or_email:
            # Check if user exists by email or username
            user_by_email = User.objects.filter(email__iexact=username_or_email).first()
            user_by_username = User.objects.filter(username__iexact=username_or_email).first()
            user_match = user_by_email or user_by_username

            if not user_match:
                raise serializers.ValidationError({
                    "detail": f"Account '{username_or_email}' is not registered. Please click register below to create an account."
                })

            if not user_match.is_active:
                raise serializers.ValidationError({
                    "detail": "This account is inactive. Please contact support."
                })

            # Strict role enforcement: verify that user's registered role matches the login tab
            if requested_role:
                req_r = str(requested_role).strip().upper()
                user_r = str(user_match.role).strip().upper()

                if req_r in ('USER', 'CUSTOMER') and user_r not in ('CUSTOMER', 'USER'):
                    raise serializers.ValidationError({
                        "detail": f"Access Denied: Account '{username_or_email}' is registered as a {user_r} and cannot log in through the User/Customer tab. Please switch to the {user_r.title()} login tab."
                    })
                elif req_r == 'BROKER' and user_r not in ('BROKER', 'SENIOR_BROKER'):
                    role_name = 'User' if user_r in ('CUSTOMER', 'USER') else 'Admin'
                    raise serializers.ValidationError({
                        "detail": f"Access Denied: Account '{username_or_email}' is registered as a {user_r} and cannot log in as a Broker. Please select the {role_name} login tab."
                    })
                elif req_r == 'ADMIN' and user_r != 'ADMIN':
                    role_name = 'User' if user_r in ('CUSTOMER', 'USER') else 'Broker'
                    raise serializers.ValidationError({
                        "detail": f"Access Denied: Account '{username_or_email}' is registered as a {user_r} and does not have Administrator access. Please select the {role_name} login tab."
                    })

            attrs['username'] = user_match.username

        try:
            data = super().validate(attrs)
        except Exception:
            raise serializers.ValidationError({
                "detail": "Incorrect password. Please verify your credentials and try again."
            })

        data['user'] = {
            'id': str(self.user.id),
            'username': self.user.username,
            'email': self.user.email,
            'full_name': self.user.get_full_name(),
            'role': self.user.role,
            'organization_id': str(self.user.organization_id) if self.user.organization_id else None,
            'customer_id': str(self.user.customer_id) if self.user.customer_id else None,
            'company_name': self.user.company_name or (self.user.organization.name if self.user.organization else ''),
        }
        return data



class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'company_name', 'organization', 'organization_name',
            'customer_id', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=False)
    company_name = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(required=False, default='CUSTOMER')

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'confirm_password',
            'full_name', 'phone', 'company_name', 'role'
        ]

    def validate(self, attrs):
        email = attrs.get('email')
        if not email:
            raise serializers.ValidationError({"email": "Email address is required."})

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({
                "email": "An account with this email address already exists. Please sign in instead."
            })

        # Normalize role case
        raw_role = str(attrs.get('role', 'CUSTOMER')).strip().upper()
        if raw_role in ('USER', 'CUSTOMER'):
            attrs['role'] = UserRole.CUSTOMER
        elif raw_role in ('BROKER', 'SENIOR_BROKER'):
            attrs['role'] = UserRole.BROKER
        elif raw_role == 'ADMIN':
            attrs['role'] = UserRole.ADMIN
        else:
            attrs['role'] = UserRole.CUSTOMER

        # Auto-generate username from email if not provided
        if not attrs.get('username'):
            base_username = email.split('@')[0].lower().replace('.', '_').replace('-', '_')
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
            attrs['username'] = username

        if 'confirm_password' in attrs and attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs


    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        full_name = validated_data.pop('full_name', '')
        company_name = validated_data.get('company_name', '')
        role = validated_data.get('role', UserRole.CUSTOMER)

        first_name = ''
        last_name = ''
        if full_name:
            parts = full_name.strip().split(' ', 1)
            first_name = parts[0]
            if len(parts) > 1:
                last_name = parts[1]

        # Auto-create organization for corporate user/broker
        org = None
        if company_name:
            org_code = company_name.upper().replace(' ', '_')[:20]
            org, _ = Organization.objects.get_or_create(
                code=org_code,
                defaults={'name': company_name, 'country': 'IN'}
            )

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            phone=validated_data.get('phone', ''),
            company_name=company_name,
            role=role,
            organization=org,
            is_staff=(role in (UserRole.ADMIN, UserRole.PRICING_MANAGER))
        )
        return user
