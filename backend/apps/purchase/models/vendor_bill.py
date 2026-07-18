from django.conf import settings
from django.db import models

from apps.utils.enums import InvoiceStatus
from apps.utils.models.base import CompanyScopedModel


class VendorBill(CompanyScopedModel):
    bill_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey(
        "purchase.Supplier",
        on_delete=models.PROTECT,
        related_name="vendor_bills",
    )
    purchase_order = models.ForeignKey(
        "purchase.PurchaseOrder",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="vendor_bills",
    )
    date = models.DateField()
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.DRAFT,
    )
    notes = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="vendor_bills_created",
    )

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.bill_number

    def save(self, *args, **kwargs):
        if not self.bill_number:
            self.bill_number = self._generate_bill_number()
        super().save(*args, **kwargs)

    def _generate_bill_number(self):
        from django.utils import timezone

        prefix = f"VB-{timezone.now().strftime('%Y%m%d')}-"
        last = (
            VendorBill.objects.filter(
                company=self.company, bill_number__startswith=prefix
            )
            .order_by("-bill_number")
            .values_list("bill_number", flat=True)
            .first()
        )
        if last:
            seq = int(last.split("-")[-1]) + 1
        else:
            seq = 1
        return f"{prefix}{seq:04d}"
