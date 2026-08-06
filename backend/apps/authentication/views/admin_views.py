from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.utils.permissions import IsSuperAdmin
from apps.authentication.models import User
from apps.companies.models import Company
from apps.accounting.models import Account, Budget, FixedAsset
from apps.employees.models import Employee
from apps.hr.models import JobPosting, Payslip
from apps.authentication.serializers.auth_serializers import UserSerializer, UserUpdateSerializer
from apps.companies.serializers.company_serializers import CompanySerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_stats(request):
    return Response({
        "total_users": User.objects.count(),
        "active_users": User.objects.filter(is_active=True).count(),
        "total_companies": Company.objects.count(),
        "total_employees": Employee.objects.count(),
        "total_accounts": Account.objects.count(),
        "total_budgets": Budget.objects.count(),
        "total_assets": FixedAsset.objects.count(),
        "total_job_postings": JobPosting.objects.count(),
        "total_payslips": Payslip.objects.count(),
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
        return User.objects.select_related("company").all()

    def get_serializer_class(self):
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
    serializer_class = CompanySerializer
    search_fields = ["name", "email", "city", "country"]
    ordering_fields = ["name", "created_at"]
    filterset_fields = ["is_active"]

    def get_queryset(self):
        return Company.objects.annotate(user_count=Count("users")).all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
