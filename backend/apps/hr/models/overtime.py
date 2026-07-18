from django.conf import settings
from django.db import models
from apps.utils.models.base import CompanyScopedModel


class Overtime(CompanyScopedModel):
    OVERTIME_STATUS = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="overtimes",
    )
    date = models.DateField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=OVERTIME_STATUS,
        default="pending",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_overtimes",
    )

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.employee} - {self.date} ({self.hours}h)"
