from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.authentication.views.auth_views import (
    ChangePasswordView,
    LoginHistoryView,
    LoginView,
    LogoutView,
    ProfileView,
    RegisterView,
    RoleViewSet,
    TokenRefreshView,
    TwoFactorSetupView,
    TwoFactorVerifyView,
    UserViewSet,
    UserRoleViewSet,
)

router = DefaultRouter()
router.register("roles", RoleViewSet, basename="role")
router.register("user-roles", UserRoleViewSet, basename="user-role")
router.register("users", UserViewSet, basename="user")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("2fa/setup/", TwoFactorSetupView.as_view(), name="2fa-setup"),
    path("2fa/verify/", TwoFactorVerifyView.as_view(), name="2fa-verify"),
    path("login-history/", LoginHistoryView.as_view(), name="login-history"),
    path("", include(router.urls)),
]
