from django.db import models
from apps.utils.models.base import CompanyScopedModel


class Branch(CompanyScopedModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    is_headquarters = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = [("company", "code")]
        ordering = ["name"]

    def __str__(self):
        return f"{self.company.name} - {self.name}"
