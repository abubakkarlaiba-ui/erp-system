from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.utils.permissions import IsSuperAdmin


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_stats(request):
    from django.contrib.auth import get_user_model
    from django.db.models import Count
    User = get_user_model()
    from apps.companies.models import Company

    return Response({
        "total_users": User.objects.count(),
        "active_users": User.objects.filter(is_active=True).count(),
        "total_companies": Company.objects.count(),
        "users_by_role": list(
            User.objects.values("role").annotate(count=Count("id")).order_by("-count")
        ),
        "users_by_company": list(
            User.objects.filter(company__isnull=False)
            .values(company_name="company__name")
            .annotate(count=Count("id"))
            .order_by("-count")
        ),
    })


class AdminUserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    search_fields = ["email", "first_name", "last_name", "phone"]
    ordering_fields = ["email", "first_name", "last_name", "role", "is_active", "created_at"]
    filterset_fields = ["role", "company", "is_active", "is_verified", "is_superuser"]

    def get_queryset(self):
        from apps.authentication.models import User
        return User.objects.select_related("company").all()

    def get_serializer_class(self):
        from apps.authentication.serializers.auth_serializers import UserSerializer, UserUpdateSerializer
        if self.action in ("update", "partial_update"):
            return UserUpdateSerializer
        return UserSerializer

    def perform_destroy(self, instance):
        if instance.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Cannot delete superusers.")
        instance.delete()


class AdminCompanyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    search_fields = ["name", "email", "city", "country"]
    ordering_fields = ["name", "created_at"]

    def get_queryset(self):
        from apps.companies.models import Company
        return Company.objects.all()

    def get_serializer_class(self):
        from apps.companies.serializers.company_serializers import CompanySerializer
        return CompanySerializer
