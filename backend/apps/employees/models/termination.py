from django.db import models


class Termination(models.Model):
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="terminations",
    )
    termination_date = models.DateField()
    reason = models.TextField()

    class TerminationType(models.TextChoices):
        VOLUNTARY = "voluntary", "Voluntary"
        INVOLUNTARY = "involuntary", "Involuntary"
        REDUNDANCY = "redundancy", "Redundancy"
        PERFORMANCE = "performance", "Performance"

    termination_type = models.CharField(max_length=15, choices=TerminationType.choices)
    approved_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_terminations",
    )

    class Meta:
        ordering = ["-termination_date"]
        verbose_name = "termination"
        verbose_name_plural = "terminations"

    def __str__(self):
        return f"{self.employee} - Termination ({self.termination_type})"
