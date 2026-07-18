from django.conf import settings
from django.db import models

from apps.utils.enums import JournalEntryStatus
from apps.utils.models.base import CompanyScopedModel

from .account import Account


class JournalEntry(CompanyScopedModel):
    entry_number = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    reference = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField()
    fiscal_year = models.ForeignKey(
        "companies.FiscalYear",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=JournalEntryStatus.choices,
        default=JournalEntryStatus.DRAFT,
    )
    total_debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="journal_entries",
    )

    class Meta(CompanyScopedModel.Meta):
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.entry_number} - {self.description[:50]}"


class JournalLine(models.Model):
    journal_entry = models.ForeignKey(
        JournalEntry,
        on_delete=models.CASCADE,
        related_name="lines",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="journal_lines",
    )
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    description = models.CharField(max_length=255, null=True, blank=True)
    line_number = models.PositiveIntegerField()

    class Meta:
        ordering = ["line_number"]
        unique_together = ("journal_entry", "line_number")

    def __str__(self):
        return f"Line {self.line_number}: {self.account.name}"
