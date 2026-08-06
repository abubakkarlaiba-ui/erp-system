from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


def _is_super_admin(user):
    return user.is_authenticated and user.is_superuser


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    if not _is_super_admin(request.user):
        return Response({"error": "Forbidden"}, status=403)

    from django.contrib.auth import get_user_model
    from django.db.models import Count
    User = get_user_model()
    from apps.companies.models import Company

    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    total_companies = Company.objects.count()

    role_stats = list(
        User.objects.values("role").annotate(count=Count("id")).order_by("-count")
    )

    company_stats = []
    for row in User.objects.filter(company__isnull=False).values("company").annotate(count=Count("id")).order_by("-count"):
        try:
            comp = Company.objects.get(id=row["company"])
            company_stats.append({"company_name": comp.name, "count": row["count"]})
        except Company.DoesNotExist:
            company_stats.append({"company_name": "Unknown", "count": row["count"]})

    return Response({
        "total_users": total_users,
        "active_users": active_users,
        "total_companies": total_companies,
        "users_by_role": role_stats,
        "users_by_company": company_stats,
    })


class AdminUserViewSet(viewsets.ModelViewSet):
    search_fields = ["email", "first_name", "last_name", "phone"]
    ordering_fields = ["email", "first_name", "last_name", "role", "is_active", "created_at"]
    filterset_fields = ["role", "company", "is_active", "is_verified", "is_superuser"]

    def get_permissions(self):
        return [IsAuthenticated()]

    def check_permissions(self, request):
        if not _is_super_admin(request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Super admin only.")

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
    search_fields = ["name", "email", "city", "country"]
    ordering_fields = ["name", "created_at"]

    def get_permissions(self):
        return [IsAuthenticated()]

    def check_permissions(self, request):
        if not _is_super_admin(request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Super admin only.")

    def get_queryset(self):
        from apps.companies.models import Company
        return Company.objects.all()

    def get_serializer_class(self):
        from apps.companies.serializers.company_serializers import CompanySerializer
        return CompanySerializer
