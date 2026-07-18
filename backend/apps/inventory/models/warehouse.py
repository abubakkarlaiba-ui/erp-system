from django.core.validators import MinValueValidator
from django.db import models

from apps.utils.models.base import CompanyScopedModel


class Warehouse(CompanyScopedModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    address = models.CharField(max_length=500, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True)
    manager = models.ForeignKey(
        "employees.Employee",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_warehouses",
    )
    phone = models.CharField(max_length=50, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        unique_together = ["company", "code"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class Bin(models.Model):
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="bins",
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    capacity = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    current_occupancy = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.warehouse.name} - {self.name}"
