from django.db import models

from apps.utils.models.base import CompanyScopedModel


class FixedAsset(CompanyScopedModel):
    DEPRECIATION_METHOD_CHOICES = [
        ("straight_line", "Straight Line"),
        ("declining_balance", "Declining Balance"),
        ("units_of_production", "Units of Production"),
    ]

    ASSET_STATUS_CHOICES = [
        ("active", "Active"),
        ("disposed", "Disposed"),
        ("maintenance", "Maintenance"),
    ]

    name = models.CharField(max_length=255)
    asset_code = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=255)
    purchase_date = models.DateField()
    purchase_value = models.DecimalField(max_digits=15, decimal_places=2)
    depreciation_method = models.CharField(
        max_length=30,
        choices=DEPRECIATION_METHOD_CHOICES,
    )
    useful_life_years = models.PositiveIntegerField()
    accumulated_depreciation = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )
    current_value = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=ASSET_STATUS_CHOICES,
        default="active",
    )
    location = models.CharField(max_length=255, null=True, blank=True)

    class Meta(CompanyScopedModel.Meta):
        ordering = ["-purchase_date"]

    def __str__(self):
        return f"{self.asset_code} - {self.name}"

    @property
    def depreciation_rate(self):
        if self.useful_life_years == 0:
            return 0
        return 100 / self.useful_life_years
