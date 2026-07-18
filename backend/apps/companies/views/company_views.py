from django.utils.decorators import method_decorator
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from apps.utils.permissions import IsCompanyOwnerOrEmployee, IsSuperAdmin
from apps.companies.models import (
    Company,
    Branch,
    Department,
    Designation,
    FiscalYear,
    Holiday,
    CompanyPolicy,
)
from apps.companies.serializers.company_serializers import (
    CompanySerializer,
    CompanyCreateUpdateSerializer,
    BranchSerializer,
    DepartmentSerializer,
    DesignationSerializer,
    FiscalYearSerializer,
    HolidaySerializer,
    CompanyPolicySerializer,
)


company_list_schema = extend_schema(
    summary="List companies",
    description="Returns all companies for the user's company. Super admin sees all.",
    tags=["Companies"],
)
company_create_schema = extend_schema(
    summary="Create a company",
    tags=["Companies"],
)
company_retrieve_schema = extend_schema(
    summary="Retrieve a company",
    tags=["Companies"],
)
company_update_schema = extend_schema(
    summary="Update a company",
    tags=["Companies"],
)
company_partial_update_schema = extend_schema(
    summary="Partially update a company",
    tags=["Companies"],
)
company_destroy_schema = extend_schema(
    summary="Delete a company",
    tags=["Companies"],
)

branch_list_schema = extend_schema(
    summary="List branches",
    tags=["Branches"],
)
branch_create_schema = extend_schema(
    summary="Create a branch",
    tags=["Branches"],
)
branch_retrieve_schema = extend_schema(
    summary="Retrieve a branch",
    tags=["Branches"],
)
branch_update_schema = extend_schema(
    summary="Update a branch",
    tags=["Branches"],
)
branch_partial_update_schema = extend_schema(
    summary="Partially update a branch",
    tags=["Branches"],
)
branch_destroy_schema = extend_schema(
    summary="Delete a branch",
    tags=["Branches"],
)

department_list_schema = extend_schema(
    summary="List departments",
    tags=["Departments"],
)
department_create_schema = extend_schema(
    summary="Create a department",
    tags=["Departments"],
)
department_retrieve_schema = extend_schema(
    summary="Retrieve a department",
    tags=["Departments"],
)
department_update_schema = extend_schema(
    summary="Update a department",
    tags=["Departments"],
)
department_partial_update_schema = extend_schema(
    summary="Partially update a department",
    tags=["Departments"],
)
department_destroy_schema = extend_schema(
    summary="Delete a department",
    tags=["Departments"],
)

designation_list_schema = extend_schema(
    summary="List designations",
    tags=["Designations"],
)
designation_create_schema = extend_schema(
    summary="Create a designation",
    tags=["Designations"],
)
designation_retrieve_schema = extend_schema(
    summary="Retrieve a designation",
    tags=["Designations"],
)
designation_update_schema = extend_schema(
    summary="Update a designation",
    tags=["Designations"],
)
designation_partial_update_schema = extend_schema(
    summary="Partially update a designation",
    tags=["Designations"],
)
designation_destroy_schema = extend_schema(
    summary="Delete a designation",
    tags=["Designations"],
)

fiscal_year_list_schema = extend_schema(
    summary="List fiscal years",
    tags=["Fiscal Years"],
)
fiscal_year_create_schema = extend_schema(
    summary="Create a fiscal year",
    tags=["Fiscal Years"],
)
fiscal_year_retrieve_schema = extend_schema(
    summary="Retrieve a fiscal year",
    tags=["Fiscal Years"],
)
fiscal_year_update_schema = extend_schema(
    summary="Update a fiscal year",
    tags=["Fiscal Years"],
)
fiscal_year_partial_update_schema = extend_schema(
    summary="Partially update a fiscal year",
    tags=["Fiscal Years"],
)
fiscal_year_destroy_schema = extend_schema(
    summary="Delete a fiscal year",
    tags=["Fiscal Years"],
)

holiday_list_schema = extend_schema(
    summary="List holidays",
    tags=["Holidays"],
)
holiday_create_schema = extend_schema(
    summary="Create a holiday",
    tags=["Holidays"],
)
holiday_retrieve_schema = extend_schema(
    summary="Retrieve a holiday",
    tags=["Holidays"],
)
holiday_update_schema = extend_schema(
    summary="Update a holiday",
    tags=["Holidays"],
)
holiday_partial_update_schema = extend_schema(
    summary="Partially update a holiday",
    tags=["Holidays"],
)
holiday_destroy_schema = extend_schema(
    summary="Delete a holiday",
    tags=["Holidays"],
)

policy_list_schema = extend_schema(
    summary="List company policies",
    tags=["Company Policies"],
)
policy_create_schema = extend_schema(
    summary="Create a company policy",
    tags=["Company Policies"],
)
policy_retrieve_schema = extend_schema(
    summary="Retrieve a company policy",
    tags=["Company Policies"],
)
policy_update_schema = extend_schema(
    summary="Update a company policy",
    tags=["Company Policies"],
)
policy_partial_update_schema = extend_schema(
    summary="Partially update a company policy",
    tags=["Company Policies"],
)
policy_destroy_schema = extend_schema(
    summary="Delete a company policy",
    tags=["Company Policies"],
)


def _get_user_company(request):
    if hasattr(request.user, "company") and request.user.company:
        return request.user.company
    return None


def _filter_by_company(queryset, request):
    if request.user.is_superuser:
        return queryset
    company = _get_user_company(request)
    if company:
        return queryset.filter(company=company)
    return queryset.none()


@extend_schema_view(
    list=company_list_schema,
    create=company_create_schema,
    retrieve=company_retrieve_schema,
    update=company_update_schema,
    partial_update=company_partial_update_schema,
    destroy=company_destroy_schema,
)
class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        return _filter_by_company(Company.objects.all(), self.request)

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return CompanyCreateUpdateSerializer
        return CompanySerializer

    def perform_create(self, serializer):
        serializer.save()


@extend_schema_view(
    list=branch_list_schema,
    create=branch_create_schema,
    retrieve=branch_retrieve_schema,
    update=branch_update_schema,
    partial_update=branch_partial_update_schema,
    destroy=branch_destroy_schema,
)
class BranchViewSet(viewsets.ModelViewSet):
    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        qs = Branch.objects.all()
        if self.kwargs.get("company_pk"):
            qs = qs.filter(company_id=self.kwargs["company_pk"])
        return _filter_by_company(qs, self.request)

    def perform_create(self, serializer):
        company_id = self.kwargs.get("company_pk")
        if company_id:
            serializer.save(company_id=company_id)
        else:
            serializer.save()


@extend_schema_view(
    list=department_list_schema,
    create=department_create_schema,
    retrieve=department_retrieve_schema,
    update=department_update_schema,
    partial_update=department_partial_update_schema,
    destroy=department_destroy_schema,
)
class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        qs = Department.objects.select_related("head", "parent").all()
        if self.kwargs.get("company_pk"):
            qs = qs.filter(company_id=self.kwargs["company_pk"])
        return _filter_by_company(qs, self.request)

    def perform_create(self, serializer):
        company_id = self.kwargs.get("company_pk")
        if company_id:
            serializer.save(company_id=company_id)
        else:
            serializer.save()


@extend_schema_view(
    list=designation_list_schema,
    create=designation_create_schema,
    retrieve=designation_retrieve_schema,
    update=designation_update_schema,
    partial_update=designation_partial_update_schema,
    destroy=designation_destroy_schema,
)
class DesignationViewSet(viewsets.ModelViewSet):
    serializer_class = DesignationSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        qs = Designation.objects.select_related("department").all()
        if self.kwargs.get("company_pk"):
            qs = qs.filter(company_id=self.kwargs["company_pk"])
        return _filter_by_company(qs, self.request)

    def perform_create(self, serializer):
        company_id = self.kwargs.get("company_pk")
        if company_id:
            serializer.save(company_id=company_id)
        else:
            serializer.save()


@extend_schema_view(
    list=fiscal_year_list_schema,
    create=fiscal_year_create_schema,
    retrieve=fiscal_year_retrieve_schema,
    update=fiscal_year_update_schema,
    partial_update=fiscal_year_partial_update_schema,
    destroy=fiscal_year_destroy_schema,
)
class FiscalYearViewSet(viewsets.ModelViewSet):
    serializer_class = FiscalYearSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        qs = FiscalYear.objects.all()
        if self.kwargs.get("company_pk"):
            qs = qs.filter(company_id=self.kwargs["company_pk"])
        return _filter_by_company(qs, self.request)

    def perform_create(self, serializer):
        company_id = self.kwargs.get("company_pk")
        if company_id:
            serializer.save(company_id=company_id)
        else:
            serializer.save()


@extend_schema_view(
    list=holiday_list_schema,
    create=holiday_create_schema,
    retrieve=holiday_retrieve_schema,
    update=holiday_update_schema,
    partial_update=holiday_partial_update_schema,
    destroy=holiday_destroy_schema,
)
class HolidayViewSet(viewsets.ModelViewSet):
    serializer_class = HolidaySerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        qs = Holiday.objects.select_related("branch").all()
        if self.kwargs.get("company_pk"):
            qs = qs.filter(company_id=self.kwargs["company_pk"])
        return _filter_by_company(qs, self.request)

    def perform_create(self, serializer):
        company_id = self.kwargs.get("company_pk")
        if company_id:
            serializer.save(company_id=company_id)
        else:
            serializer.save()


@extend_schema_view(
    list=policy_list_schema,
    create=policy_create_schema,
    retrieve=policy_retrieve_schema,
    update=policy_update_schema,
    partial_update=policy_partial_update_schema,
    destroy=policy_destroy_schema,
)
class CompanyPolicyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyPolicySerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        qs = CompanyPolicy.objects.all()
        if self.kwargs.get("company_pk"):
            qs = qs.filter(company_id=self.kwargs["company_pk"])
        return _filter_by_company(qs, self.request)

    def perform_create(self, serializer):
        company_id = self.kwargs.get("company_pk")
        if company_id:
            serializer.save(company_id=company_id)
        else:
            serializer.save()
