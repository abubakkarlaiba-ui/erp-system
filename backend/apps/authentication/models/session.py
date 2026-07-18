import uuid

from django.conf import settings
from django.db import models


class LoginHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="login_history",
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default="")
    success = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    failure_reason = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = "authentication_login_history"
        ordering = ["-timestamp"]
        verbose_name = "Login History"
        verbose_name_plural = "Login Histories"

    def __str__(self):
        user_email = self.user.email if self.user else "unknown"
        status = "success" if self.success else "failed"
        return f"{user_email} - {status} - {self.timestamp}"
