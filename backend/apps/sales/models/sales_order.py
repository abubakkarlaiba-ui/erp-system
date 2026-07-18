from django.conf import settings
from django.db import models

from apps.utils.enums import OrderStatus
from apps.utils.models.base import CompanyScopedModel


class SalesOrder(CompanyScopedModel):
    order_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(
        "sales.Customer",
        on_delete=models.PROTECT,
        related_name="sales_orders",
    )
    quotation = models.ForeignKey(
        "sales.Quotation",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales_orders",
    )
    date = models.DateField()
    required_date = models.DateField(null=True, blank=True)
    shipped_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.DRAFT,
    )
    shipping_address = models.TextField(null=True, blank=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_sales_orders",
    )

    class Meta(CompanyScopedModel.Meta):
        ordering = ["-date"]

    def __str__(self):
        return self.order_number

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self._generate_number()
        super().save(*args, **kwargs)

    def _generate_number(self):
        from django.utils import timezone

        prefix = "SO"
        year = timezone.now().strftime("%Y")
        last = (
            SalesOrder.objects.filter(order_number__startswith=f"{prefix}-{year}")
            .order_by("-order_number")
            .first()
        )
        if last:
            seq = int(last.order_number.split("-")[-1]) + 1
        else:
            seq = 1
        return f"{prefix}-{year}-{seq:05d}"


class SalesOrderItem(models.Model):
    order = models.ForeignKey(
        SalesOrder,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        "inventory.Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales_order_items",
    )
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    quantity_delivered = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.description
