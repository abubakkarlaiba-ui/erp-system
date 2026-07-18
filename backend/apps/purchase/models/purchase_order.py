from django.conf import settings
from django.db import models

from apps.utils.enums import OrderStatus
from apps.utils.models.base import CompanyScopedModel


class PurchaseOrder(CompanyScopedModel):
    order_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey(
        "purchase.Supplier",
        on_delete=models.PROTECT,
        related_name="purchase_orders",
    )
    purchase_request = models.ForeignKey(
        "purchase.PurchaseRequest",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="purchase_orders",
    )
    date = models.DateField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.DRAFT,
    )
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_address = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="purchase_orders_created",
    )

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.order_number

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self._generate_order_number()
        super().save(*args, **kwargs)

    def _generate_order_number(self):
        from django.utils import timezone

        prefix = f"PO-{timezone.now().strftime('%Y%m%d')}-"
        last = (
            PurchaseOrder.objects.filter(
                company=self.company, order_number__startswith=prefix
            )
            .order_by("-order_number")
            .values_list("order_number", flat=True)
            .first()
        )
        if last:
            seq = int(last.split("-")[-1]) + 1
        else:
            seq = 1
        return f"{prefix}{seq:04d}"

    def recalculate_totals(self):
        items = self.items.all()
        self.subtotal = sum(item.total for item in items)
        self.tax_amount = sum(
            item.total * item.tax_rate / 100 for item in items
        )
        self.total = self.subtotal + self.tax_amount - self.discount_amount
        self.save(
            update_fields=["subtotal", "tax_amount", "total"]
        )


class PurchaseOrderItem(models.Model):
    order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        "inventory.Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="purchase_order_items",
    )
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    quantity_received = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.description} x {self.quantity}"

    def save(self, *args, **kwargs):
        line_total = self.quantity * self.unit_price
        tax = line_total * self.tax_rate / 100
        self.total = line_total + tax - self.discount
        super().save(*args, **kwargs)
