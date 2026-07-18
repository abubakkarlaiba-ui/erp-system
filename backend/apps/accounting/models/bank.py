from django.db import models

from apps.utils.models.base import CompanyScopedModel


class BankAccount(CompanyScopedModel):
    ACCOUNT_TYPE_CHOICES = [
        ("savings", "Savings"),
        ("current", "Current"),
        ("loan", "Loan"),
    ]

    name = models.CharField(max_length=255)
    bank_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=50)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES)
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    class Meta(CompanyScopedModel.Meta):
        ordering = ["name"]

    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"


class BankTransaction(models.Model):
    RECONCILIATION_CHOICES = [
        ("unreconciled", "Unreconciled"),
        ("reconciled", "Reconciled"),
    ]

    bank_account = models.ForeignKey(
        BankAccount,
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    date = models.DateField()
    description = models.CharField(max_length=500)
    reference = models.CharField(max_length=255, null=True, blank=True)
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    reconciliation_status = models.CharField(
        max_length=20,
        choices=RECONCILIATION_CHOICES,
        default="unreconciled",
    )

    class Meta:
        ordering = ["-date", "-id"]

    def __str__(self):
        return f"{self.bank_account.name} - {self.date} - {self.description[:50]}"
