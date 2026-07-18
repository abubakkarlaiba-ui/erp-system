import pyotp
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView

from apps.authentication.models import LoginHistory, Role, UserRole
from apps.authentication.serializers import (
    ChangePasswordSerializer,
    LoginHistorySerializer,
    LoginSerializer,
    RegisterSerializer,
    RoleSerializer,
    TwoFactorSetupSerializer,
    TwoFactorVerifySerializer,
    UserSerializer,
    UserRoleSerializer,
    UserUpdateSerializer,
)
from apps.utils.permissions import IsSuperAdmin

User = get_user_model()


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def get_user_agent(request):
    return request.META.get("HTTP_USER_AGENT", "")[:500]


@extend_schema(tags=["Authentication"])
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Authentication"])
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        user = authenticate(request, username=email, password=password)

        if user is None:
            LoginHistory.objects.create(
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request),
                success=False,
                failure_reason="Invalid credentials",
            )
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            LoginHistory.objects.create(
                user=user,
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request),
                success=False,
                failure_reason="Account disabled",
            )
            return Response(
                {"error": "Account is disabled."},
                status=status.HTTP_403_FORBIDDEN,
            )

        LoginHistory.objects.create(
            user=user,
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request),
            success=True,
        )

        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        if user.two_factor_enabled:
            return Response(
                {
                    "requires_2fa": True,
                    "user_id": str(user.id),
                },
                status=status.HTTP_200_OK,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Authentication"])
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response(
                {"error": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {"message": "Successfully logged out."},
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Authentication"])
class TokenRefreshView(BaseTokenRefreshView):
    pass


@extend_schema(tags=["Authentication"])
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@extend_schema(tags=["Authentication"])
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Authentication"])
class TwoFactorSetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TwoFactorSetupSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        secret = pyotp.random_base32()
        request.user.two_factor_secret = secret
        request.user.save(update_fields=["two_factor_secret"])

        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=request.user.email,
            issuer_name="ERP System",
        )

        return Response(
            {
                "secret": secret,
                "qr_code_url": provisioning_uri,
                "message": "Scan the QR code with your authenticator app, then verify with /2fa/verify/.",
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Authentication"])
class TwoFactorVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = TwoFactorVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data["code"]

        if request.user and request.user.is_authenticated:
            user = request.user
            if not user.two_factor_secret:
                return Response(
                    {"error": "2FA setup not initiated. Call /2fa/setup/ first."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            totp = pyotp.TOTP(user.two_factor_secret)
            if not totp.verify(code):
                return Response(
                    {"error": "Invalid verification code."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.two_factor_enabled = True
            user.save(update_fields=["two_factor_enabled"])
            return Response(
                {"message": "Two-factor authentication enabled successfully."},
                status=status.HTTP_200_OK,
            )

        user_id = serializer.validated_data.get("user_id")
        if not user_id:
            return Response(
                {"error": "user_id is required for login verification."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not user.two_factor_enabled or not user.two_factor_secret:
            return Response(
                {"error": "2FA is not enabled for this user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        totp = pyotp.TOTP(user.two_factor_secret)
        if not totp.verify(code):
            LoginHistory.objects.create(
                user=user,
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request),
                success=False,
                failure_reason="Invalid 2FA code",
            )
            return Response(
                {"error": "Invalid verification code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        LoginHistory.objects.create(
            user=user,
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request),
            success=True,
        )

        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Authentication"])
class LoginHistoryView(generics.ListAPIView):
    serializer_class = LoginHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LoginHistory.objects.filter(user=self.request.user)


@extend_schema_view(
    list=extend_schema(tags=["Roles"]),
    create=extend_schema(tags=["Roles"]),
    retrieve=extend_schema(tags=["Roles"]),
    update=extend_schema(tags=["Roles"]),
    partial_update=extend_schema(tags=["Roles"]),
    destroy=extend_schema(tags=["Roles"]),
)
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]


@extend_schema_view(
    list=extend_schema(tags=["User Roles"]),
    create=extend_schema(tags=["User Roles"]),
    destroy=extend_schema(tags=["User Roles"]),
)
class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.select_related("user", "role").all()
    serializer_class = UserRoleSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    http_method_names = ["get", "post", "delete"]
    filterset_fields = ["user", "role"]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == User.Role.SUPER_ADMIN:
            return UserRole.objects.select_related("user", "role").all()
        if user.company:
            return UserRole.objects.select_related("user", "role").filter(user__company=user.company)
        return UserRole.objects.none()


@extend_schema_view(
    list=extend_schema(tags=["Users"]),
    create=extend_schema(tags=["Users"]),
    retrieve=extend_schema(tags=["Users"]),
    update=extend_schema(tags=["Users"]),
    partial_update=extend_schema(tags=["Users"]),
    destroy=extend_schema(tags=["Users"]),
)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ["email", "first_name", "last_name", "phone"]
    ordering_fields = ["email", "first_name", "last_name", "role", "created_at"]
    filterset_fields = ["role", "company", "is_active", "is_verified"]

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == User.Role.SUPER_ADMIN:
            return User.objects.all()
        if user.company:
            return User.objects.filter(company=user.company)
        return User.objects.none()
