from rest_framework import serializers
from apps.companies.models import (
    Company,
    Branch,
    Department,
    Designation,
    FiscalYear,
    Holiday,
    CompanyPolicy,
)


class CompanySerializer(serializers.ModelSerializer):
    branches_count = serializers.SerializerMethodField()
    employees_count = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "slug",
            "registration_number",
            "tax_id",
            "email",
            "phone",
            "website",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "country",
            "postal_code",
            "logo",
            "default_currency",
            "fiscal_year_start",
            "settings",
            "is_active",
            "created_by",
            "created_by_name",
            "branches_count",
            "employees_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_by", "created_at", "updated_at"]

    def get_branches_count(self, obj):
        try:
            return Branch.objects.filter(company=obj).count()
        except Exception:
            return 0

    def get_employees_count(self, obj):
        try:
            from apps.employees.models import Employee
            return Employee.objects.filter(company=obj).count()
        except Exception:
            return 0

    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.email
        return None


class CompanyCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "registration_number",
            "tax_id",
            "email",
            "phone",
            "website",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "country",
            "postal_code",
            "logo",
            "default_currency",
            "fiscal_year_start",
            "settings",
            "is_active",
        ]
        read_only_fields = ["id"]


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = [
            "id",
            "company",
            "name",
            "code",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "country",
            "postal_code",
            "phone",
            "email",
            "is_headquarters",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DepartmentSerializer(serializers.ModelSerializer):
    head_name = serializers.CharField(source="head.full_name", read_only=True)
    parent_name = serializers.CharField(source="parent.name", read_only=True)

    class Meta:
        model = Department
        fields = [
            "id",
            "company",
            "name",
            "code",
            "description",
            "head",
            "head_name",
            "parent",
            "parent_name",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DesignationSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Designation
        fields = [
            "id",
            "company",
            "name",
            "code",
            "department",
            "department_name",
            "level",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class FiscalYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = FiscalYear
        fields = [
            "id",
            "company",
            "name",
            "start_date",
            "end_date",
            "is_current",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class HolidaySerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source="branch.name", read_only=True)

    class Meta:
        model = Holiday
        fields = [
            "id",
            "company",
            "name",
            "date",
            "description",
            "is_recurring",
            "branch",
            "branch_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CompanyPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyPolicy
        fields = [
            "id",
            "company",
            "title",
            "content",
            "category",
            "is_active",
            "effective_date",
            "expiry_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
