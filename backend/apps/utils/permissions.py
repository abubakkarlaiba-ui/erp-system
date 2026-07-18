from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser


class IsCompanyOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "role")
            and request.user.role == "company_owner"
        )


class HasModulePermission(permissions.BasePermission):
    def __init__(self, module=None):
        self.module = module

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        if hasattr(request.user, "role") and request.user.role == "super_admin":
            return True

        module = self.module or getattr(view, "permission_module", None)
        if not module:
            return True

        return request.user.has_module_permission(module, request.method)

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user


class IsCompanyOwnerOrEmployee(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "role")
            and request.user.role in ("company_owner", "employee")
        )


class IsSameCompany(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        if hasattr(obj, "company"):
            return obj.company_id == request.user.company_id
        return True
