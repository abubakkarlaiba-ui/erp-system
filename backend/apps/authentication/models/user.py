import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.authentication.managers import UserManager


class User(AbstractUser):
class User(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super Admin"
        COMPANY_OWNER = "company_owner", "Company Owner"
        ADMIN = "admin", "Admin"
        HR_MANAGER = "hr_manager", "HR Manager"
        HR_STAFF = "hr_staff", "HR Staff"
        FINANCE_MANAGER = "finance_manager", "Finance Manager"
        ACCOUNTANT = "accountant", "Accountant"
        SALES_MANAGER = "sales_manager", "Sales Manager"
        SALES_STAFF = "sales_staff", "Sales Staff"
        PURCHASE_MANAGER = "purchase_manager", "Purchase Manager"
        PURCHASE_STAFF = "purchase_staff", "Purchase Staff"
        WAREHOUSE_MANAGER = "warehouse_manager", "Warehouse Manager"
        INVENTORY_STAFF = "inventory_staff", "Inventory Staff"
        PROJECT_MANAGER = "project_manager", "Project Manager"
        EMPLOYEE = "employee", "Employee"
        CUSTOMER = "customer", "Customer"
        VENDOR = "vendor", "Vendor"
        AUDITOR = "auditor", "Auditor"
        CUSTOM = "custom", "Custom"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    phone = models.CharField(max_length=20, blank=True, default="")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    role = models.CharField(max_length=30, choices=Role.choices, default=Role.EMPLOYEE)
    is_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=64, blank=True, default="")
    timezone = models.CharField(max_length=50, default="UTC")
    language = models.CharField(max_length=10, default="en")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        db_table = "authentication_user"
        ordering = ["-created_at"]
        verbose_name = "user"
        verbose_name_plural = "users"

    def __str__(self):
        return self.email

    def has_role(self, role_name):
        return self.role == role_name

    def has_module_permission(self, module, method):
        if self.is_superuser or self.role == self.Role.SUPER_ADMIN:
            return True

        MODULE_ACCESS = {
            self.Role.COMPANY_OWNER: None,
            self.Role.ADMIN: None,
            self.Role.HR_MANAGER: ["hr", "employees"],
            self.Role.HR_STAFF: ["hr", "employees"],
            self.Role.FINANCE_MANAGER: ["accounting"],
            self.Role.ACCOUNTANT: ["accounting"],
            self.Role.SALES_MANAGER: ["sales"],
            self.Role.SALES_STAFF: ["sales"],
            self.Role.PURCHASE_MANAGER: ["purchase"],
            self.Role.PURCHASE_STAFF: ["purchase"],
            self.Role.WAREHOUSE_MANAGER: ["inventory"],
            self.Role.INVENTORY_STAFF: ["inventory"],
            self.Role.PROJECT_MANAGER: [
                "hr", "employees", "inventory", "sales", "purchase", "accounting",
            ],
            self.Role.EMPLOYEE: [],
            self.Role.CUSTOMER: ["sales"],
            self.Role.VENDOR: ["purchase"],
            self.Role.AUDITOR: ["accounting", "hr"],
            self.Role.CUSTOM: [],
        }

        allowed = MODULE_ACCESS.get(self.role, [])
        if allowed is None or module in allowed:
            return True

        for user_role in self.user_roles.select_related("role").all():
            permissions = user_role.role.permissions
            if isinstance(permissions, dict):
                allowed_modules = permissions.get("modules", [])
                if "*" in allowed_modules or module in allowed_modules:
                    return True

        return False
