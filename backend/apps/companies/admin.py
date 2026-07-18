from django.contrib import admin
from apps.companies.models import (
    Company,
    Branch,
    Department,
    Designation,
    FiscalYear,
    Holiday,
    CompanyPolicy,
)


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "slug",
        "registration_number",
        "tax_id",
        "default_currency",
        "is_active",
        "created_at",
    ]
    list_filter = ["is_active", "default_currency", "country"]
    search_fields = ["name", "slug", "registration_number", "tax_id"]
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ["id", "created_at", "updated_at"]
    fieldsets = (
        (None, {"fields": ("id", "name", "slug", "is_active")}),
        ("Business Info", {"fields": ("registration_number", "tax_id", "default_currency", "fiscal_year_start")}),
        ("Contact", {"fields": ("email", "phone", "website")}),
        ("Address", {"fields": ("address_line1", "address_line2", "city", "state", "country", "postal_code")}),
        ("Media", {"fields": ("logo",)}),
        ("Settings", {"fields": ("settings",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "company", "city", "is_headquarters", "is_active"]
    list_filter = ["is_active", "is_headquarters", "company"]
    search_fields = ["name", "code"]
    readonly_fields = ["id", "created_at", "updated_at"]
    raw_id_fields = ["company"]


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "company", "head", "parent", "is_active"]
    list_filter = ["is_active", "company"]
    search_fields = ["name", "code"]
    readonly_fields = ["id", "created_at", "updated_at"]
    raw_id_fields = ["company", "head", "parent"]


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "company", "department", "level", "is_active"]
    list_filter = ["is_active", "company", "department"]
    search_fields = ["name", "code"]
    readonly_fields = ["id", "created_at", "updated_at"]
    raw_id_fields = ["company", "department"]


@admin.register(FiscalYear)
class FiscalYearAdmin(admin.ModelAdmin):
    list_display = ["name", "company", "start_date", "end_date", "is_current"]
    list_filter = ["is_current", "company"]
    search_fields = ["name"]
    readonly_fields = ["id", "created_at", "updated_at"]
    raw_id_fields = ["company"]


@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ["name", "company", "date", "is_recurring", "branch"]
    list_filter = ["is_recurring", "company", "date"]
    search_fields = ["name"]
    readonly_fields = ["id", "created_at", "updated_at"]
    raw_id_fields = ["company", "branch"]


@admin.register(CompanyPolicy)
class CompanyPolicyAdmin(admin.ModelAdmin):
    list_display = ["title", "company", "category", "is_active", "effective_date", "expiry_date"]
    list_filter = ["is_active", "company", "category"]
    search_fields = ["title", "content"]
    readonly_fields = ["id", "created_at", "updated_at"]
    raw_id_fields = ["company"]
