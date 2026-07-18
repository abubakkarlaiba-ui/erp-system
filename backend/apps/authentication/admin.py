from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.authentication.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = (
        "email", "first_name", "last_name", "role", "company",
        "is_verified", "two_factor_enabled", "is_active", "is_staff",
    )
    list_filter = (
        "is_active", "is_staff", "is_superuser", "role",
        "is_verified", "two_factor_enabled", "company",
    )
    search_fields = ("email", "first_name", "last_name", "phone")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "phone", "avatar")}),
        ("Company & Role", {"fields": ("company", "role", "is_verified")}),
        ("Security", {"fields": ("two_factor_enabled", "two_factor_secret", "timezone", "language")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email", "password1", "password2", "first_name",
                    "last_name", "role", "company", "is_active", "is_staff",
                ),
            },
        ),
    )
