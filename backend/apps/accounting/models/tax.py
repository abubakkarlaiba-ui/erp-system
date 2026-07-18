from django.db import models

from apps.utils.models.base import CompanyScopedModel


class TaxRate(CompanyScopedModel):
    TAX_TYPE_CHOICES = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed"),
    ]

    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    tax_type = models.CharField(max_length=20, choices=TAX_TYPE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_compound = models.BooleanField(default=False)

    class Meta(CompanyScopedModel.Meta):
        unique_together = ("company", "code")
        ordering = ["code"]

    def __str__(self):
        if self.tax_type == "percentage":
            return f"{self.name} ({self.rate}%)"
        return f"{self.name} ({self.rate})"
