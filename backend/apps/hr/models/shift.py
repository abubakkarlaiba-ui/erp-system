from django.db import models
from apps.utils.models.base import CompanyScopedModel


class Shift(CompanyScopedModel):
    name = models.CharField(max_length=100)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    break_duration = models.PositiveIntegerField(
        default=60,
        help_text="minutes",
    )

    class Meta:
        ordering = ["start_time"]

    def __str__(self):
        return self.name


class EmployeeShift(CompanyScopedModel):
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="shifts",
    )
    shift = models.ForeignKey(
        Shift,
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    date = models.DateField()

    class Meta:
        unique_together = ("employee", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.employee} - {self.shift} ({self.date})"
