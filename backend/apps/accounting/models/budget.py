from django.db import models

from apps.utils.models.base import CompanyScopedModel

from .account import Account


class Budget(CompanyScopedModel):
    PERIOD_CHOICES = [
        ("monthly", "Monthly"),
        ("quarterly", "Quarterly"),
        ("yearly", "Yearly"),
    ]

    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="budgets",
    )
    fiscal_year = models.ForeignKey(
        "companies.FiscalYear",
        on_delete=models.CASCADE,
        related_name="budgets",
    )
    budget_amount = models.DecimalField(max_digits=15, decimal_places=2)
    actual_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    notes = models.CharField(max_length=500, null=True, blank=True)

    class Meta(CompanyScopedModel.Meta):
        ordering = ["fiscal_year", "account"]

    def __str__(self):
        return f"{self.account.name} - {self.fiscal_year} ({self.period})"

    @property
    def variance(self):
        return self.budget_amount - self.actual_amount

    @property
    def utilization_percentage(self):
        if self.budget_amount == 0:
            return 0
        return (self.actual_amount / self.budget_amount) * 100
