from django.db import models

from apps.utils.enums import AccountType
from apps.utils.models.base import CompanyScopedModel


class Account(CompanyScopedModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    account_type = models.CharField(max_length=50, choices=AccountType.choices)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    description = models.CharField(max_length=500, null=True, blank=True)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    is_system = models.BooleanField(default=False)

    class Meta(CompanyScopedModel.Meta):
        unique_together = ("company", "code")
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} - {self.name}"
