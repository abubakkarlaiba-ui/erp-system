from django.db import models
from django.utils import timezone

from apps.utils.models.base import CompanyScopedModel


class StockAdjustment(CompanyScopedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    adjustment_number = models.CharField(max_length=100, unique=True)
    warehouse = models.ForeignKey(
        "inventory.Warehouse",
        on_delete=models.CASCADE,
        related_name="adjustments",
    )
    date = models.DateField(default=timezone.now)
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    created_by = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="stock_adjustments",
    )
    approved_by = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_adjustments",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.adjustment_number} - {self.warehouse.name}"

    def save(self, *args, **kwargs):
        if not self.adjustment_number:
            today = timezone.now().strftime("%Y%m%d")
            last = (
                StockAdjustment.objects.filter(
                    company=self.company,
                    adjustment_number__startswith=f"ADJ-{today}-",
                )
                .order_by("-adjustment_number")
                .first()
            )
            if last:
                seq = int(last.adjustment_number.split("-")[-1]) + 1
            else:
                seq = 1
            self.adjustment_number = f"ADJ-{today}-{seq:04d}"
        super().save(*args, **kwargs)


class StockAdjustmentItem(models.Model):
    adjustment = models.ForeignKey(
        StockAdjustment,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        "inventory.Product",
        on_delete=models.CASCADE,
        related_name="adjustment_items",
    )
    counted_quantity = models.IntegerField()
    system_quantity = models.IntegerField()
    difference = models.IntegerField(default=0)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return f"{self.adjustment.adjustment_number} - {self.product.name}"

    def save(self, *args, **kwargs):
        self.difference = self.counted_quantity - self.system_quantity
        super().save(*args, **kwargs)
