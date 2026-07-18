from django.db import models


class Resignation(models.Model):
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="resignations",
    )
    notice_date = models.DateField()
    last_working_date = models.DateField(null=True, blank=True)
    reason = models.TextField(blank=True, default="")

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    approved_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_resignations",
    )

    class Meta:
        ordering = ["-notice_date"]
        verbose_name = "resignation"
        verbose_name_plural = "resignations"

    def __str__(self):
        return f"{self.employee} - Resignation ({self.status})"
