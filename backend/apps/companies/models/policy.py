from django.db import models
from apps.utils.models.base import CompanyScopedModel


class CompanyPolicy(CompanyScopedModel):
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    effective_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-effective_date"]
        verbose_name_plural = "company policies"

    def __str__(self):
        return f"{self.company.name} - {self.title}"
