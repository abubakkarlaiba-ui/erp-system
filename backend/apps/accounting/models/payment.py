from django.conf import settings
from django.db import models

from apps.utils.enums import PaymentMethod, PaymentStatus
from apps.utils.models.base import CompanyScopedModel

from .invoice import Invoice


class Payment(CompanyScopedModel):
    PAYMENT_TYPE_CHOICES = [
        ("incoming", "Incoming"),
        ("outgoing", "Outgoing"),
    ]

    payment_number = models.CharField(max_length=50, unique=True)
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
    )
    reference = models.CharField(max_length=255, null=True, blank=True)
    bank_account = models.ForeignKey(
        "bank.BankAccount",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    notes = models.CharField(max_length=500, null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="payments",
    )

    class Meta(CompanyScopedModel.Meta):
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.payment_number} - {self.amount}"
