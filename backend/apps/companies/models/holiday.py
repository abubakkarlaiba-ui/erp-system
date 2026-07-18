from django.db import models
from apps.utils.models.base import CompanyScopedModel


class Holiday(CompanyScopedModel):
    name = models.CharField(max_length=255)
    date = models.DateField()
    description = models.TextField(blank=True)
    is_recurring = models.BooleanField(default=False)
    branch = models.ForeignKey(
        "companies.Branch",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="holidays",
    )

    class Meta:
        ordering = ["date"]

    def __str__(self):
        return f"{self.company.name} - {self.name}"
