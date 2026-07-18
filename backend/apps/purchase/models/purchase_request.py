from django.conf import settings
from django.db import models

from apps.utils.models.base import CompanyScopedModel


class PurchaseRequest(CompanyScopedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        ORDERED = "ordered", "Ordered"

    request_number = models.CharField(max_length=50, unique=True)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="purchase_requests",
    )
    department = models.ForeignKey(
        "companies.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="purchase_requests",
    )
    date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.request_number

    def save(self, *args, **kwargs):
        if not self.request_number:
            self.request_number = self._generate_request_number()
        super().save(*args, **kwargs)

    def _generate_request_number(self):
        from django.utils import timezone

        prefix = f"PR-{timezone.now().strftime('%Y%m%d')}-"
        last = (
            PurchaseRequest.objects.filter(
                company=self.company, request_number__startswith=prefix
            )
            .order_by("-request_number")
            .values_list("request_number", flat=True)
            .first()
        )
        if last:
            seq = int(last.split("-")[-1]) + 1
        else:
            seq = 1
        return f"{prefix}{seq:04d}"


class PurchaseRequestItem(models.Model):
    request = models.ForeignKey(
        PurchaseRequest,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        "inventory.Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="purchase_request_items",
    )
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    estimated_unit_price = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    total_estimated_price = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.description} x {self.quantity}"

    def save(self, *args, **kwargs):
        self.total_estimated_price = self.quantity * self.estimated_unit_price
        super().save(*args, **kwargs)
