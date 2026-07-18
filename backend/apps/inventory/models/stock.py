from django.db import models

from apps.utils.enums import StockMovementType
from apps.utils.models.base import CompanyScopedModel


class Stock(CompanyScopedModel):
    product = models.ForeignKey(
        "inventory.Product",
        on_delete=models.CASCADE,
        related_name="stocks",
    )
    variant = models.ForeignKey(
        "inventory.ProductVariant",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="stocks",
    )
    warehouse = models.ForeignKey(
        "inventory.Warehouse",
        on_delete=models.CASCADE,
        related_name="stocks",
    )
    bin = models.ForeignKey(
        "inventory.Bin",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stocks",
    )
    quantity = models.IntegerField(default=0)
    reserved_quantity = models.IntegerField(default=0)
    batch_number = models.CharField(max_length=255, null=True, blank=True)
    serial_number = models.CharField(max_length=255, null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["product", "warehouse", "bin", "batch_number"]

    def __str__(self):
        return f"{self.product.name} - {self.warehouse.name} ({self.quantity})"

    @property
    def available_quantity(self):
        return self.quantity - self.reserved_quantity


class StockMovement(CompanyScopedModel):
    product = models.ForeignKey(
        "inventory.Product",
        on_delete=models.CASCADE,
        related_name="stock_movements",
    )
    variant = models.ForeignKey(
        "inventory.ProductVariant",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="stock_movements",
    )
    from_warehouse = models.ForeignKey(
        "inventory.Warehouse",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="outgoing_movements",
    )
    to_warehouse = models.ForeignKey(
        "inventory.Warehouse",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="incoming_movements",
    )
    quantity = models.IntegerField()
    movement_type = models.CharField(
        max_length=20,
        choices=StockMovementType.choices,
    )
    reference_number = models.CharField(max_length=255, null=True, blank=True)
    reference_model = models.CharField(max_length=255, null=True, blank=True)
    notes = models.CharField(max_length=500, null=True, blank=True)
    created_by = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="stock_movements",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.movement_type} - {self.product.name} ({self.quantity})"
