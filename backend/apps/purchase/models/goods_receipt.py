from django.conf import settings
from django.db import models


class GoodsReceipt(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PARTIAL = "partial", "Partially Received"
        COMPLETED = "completed", "Completed"

    receipt_number = models.CharField(max_length=50, unique=True)
    purchase_order = models.ForeignKey(
        "purchase.PurchaseOrder",
        on_delete=models.PROTECT,
        related_name="goods_receipts",
    )
    warehouse = models.ForeignKey(
        "inventory.Warehouse",
        on_delete=models.PROTECT,
        related_name="goods_receipts",
    )
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="goods_receipts",
    )
    date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.receipt_number

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = self._generate_receipt_number()
        super().save(*args, **kwargs)

    def _generate_receipt_number(self):
        from django.utils import timezone

        prefix = f"GR-{timezone.now().strftime('%Y%m%d')}-"
        last = (
            GoodsReceipt.objects.filter(receipt_number__startswith=prefix)
            .order_by("-receipt_number")
            .values_list("receipt_number", flat=True)
            .first()
        )
        if last:
            seq = int(last.split("-")[-1]) + 1
        else:
            seq = 1
        return f"{prefix}{seq:04d}"


class GoodsReceiptItem(models.Model):
    receipt = models.ForeignKey(
        GoodsReceipt,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        "inventory.Product",
        on_delete=models.PROTECT,
        related_name="goods_receipt_items",
    )
    purchase_order_item = models.ForeignKey(
        "purchase.PurchaseOrderItem",
        on_delete=models.PROTECT,
        related_name="receipt_items",
    )
    quantity_received = models.DecimalField(max_digits=12, decimal_places=2)
    quantity_accepted = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    quantity_rejected = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    batch_number = models.CharField(max_length=100, null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    notes = models.CharField(max_length=500, null=True, blank=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product} - {self.quantity_received}"
