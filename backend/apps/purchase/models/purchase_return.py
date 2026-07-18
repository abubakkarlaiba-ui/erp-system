from django.conf import settings
from django.db import models

from apps.utils.models.base import CompanyScopedModel


class PurchaseReturn(CompanyScopedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        SENT = "sent", "Sent"

    return_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey(
        "purchase.Supplier",
        on_delete=models.PROTECT,
        related_name="purchase_returns",
    )
    purchase_order = models.ForeignKey(
        "purchase.PurchaseOrder",
        on_delete=models.PROTECT,
        related_name="purchase_returns",
    )
    date = models.DateField()
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="purchase_returns_created",
    )

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.return_number

    def save(self, *args, **kwargs):
        if not self.return_number:
            self.return_number = self._generate_return_number()
        super().save(*args, **kwargs)

    def _generate_return_number(self):
        from django.utils import timezone

        prefix = f"PTR-{timezone.now().strftime('%Y%m%d')}-"
        last = (
            PurchaseReturn.objects.filter(
                company=self.company, return_number__startswith=prefix
            )
            .order_by("-return_number")
            .values_list("return_number", flat=True)
            .first()
        )
        if last:
            seq = int(last.split("-")[-1]) + 1
        else:
            seq = 1
        return f"{prefix}{seq:04d}"
