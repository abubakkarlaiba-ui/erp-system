from django.conf import settings
from django.db import models

from apps.utils.models.base import CompanyScopedModel


class Quotation(CompanyScopedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENT = "sent", "Sent"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        EXPIRED = "expired", "Expired"

    quotation_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(
        "sales.Customer",
        on_delete=models.PROTECT,
        related_name="quotations",
    )
    date = models.DateField()
    valid_until = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(null=True, blank=True)
    terms = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_quotations",
    )

    class Meta(CompanyScopedModel.Meta):
        ordering = ["-date"]

    def __str__(self):
        return self.quotation_number

    def save(self, *args, **kwargs):
        if not self.quotation_number:
            self.quotation_number = self._generate_number()
        super().save(*args, **kwargs)

    def _generate_number(self):
        from django.utils import timezone

        prefix = "QTN"
        year = timezone.now().strftime("%Y")
        last = (
            Quotation.objects.filter(quotation_number__startswith=f"{prefix}-{year}")
            .order_by("-quotation_number")
            .first()
        )
        if last:
            seq = int(last.quotation_number.split("-")[-1]) + 1
        else:
            seq = 1
        return f"{prefix}-{year}-{seq:05d}"


class QuotationItem(models.Model):
    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        "inventory.Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotation_items",
    )
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.description
