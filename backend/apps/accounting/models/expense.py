from django.conf import settings
from django.db import models

from apps.utils.enums import PaymentMethod
from apps.utils.models.base import CompanyScopedModel

from .account import Account


class Expense(CompanyScopedModel):
    EXPENSE_STATUS_CHOICES = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    expense_number = models.CharField(max_length=50, unique=True)
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="expenses",
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField()
    category = models.CharField(max_length=255)
    description = models.TextField()
    receipt = models.ImageField(upload_to="receipts/", null=True, blank=True)
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_expenses",
    )
    status = models.CharField(
        max_length=20,
        choices=EXPENSE_STATUS_CHOICES,
        default="draft",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="expenses",
    )

    class Meta(CompanyScopedModel.Meta):
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.expense_number} - {self.category}"
