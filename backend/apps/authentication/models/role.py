from django.conf import settings
from django.db import models

from apps.utils.models.base import UUIDModel


class Role(UUIDModel):
    name = models.CharField(max_length=100, unique=True)
    permissions = models.JSONField(default=dict, blank=True)
    description = models.TextField(blank=True, default="")

    class Meta(UUIDModel.Meta):
        db_table = "authentication_role"
        verbose_name = "Role"
        verbose_name_plural = "Roles"

    def __str__(self):
        return self.name


class UserRole(UUIDModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_roles",
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="user_roles",
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta(UUIDModel.Meta):
        db_table = "authentication_user_role"
        unique_together = ["user", "role"]
        verbose_name = "User Role"
        verbose_name_plural = "User Roles"

    def __str__(self):
        return f"{self.user.email} - {self.role.name}"
