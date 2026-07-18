from django.conf import settings
from django.db import models

from apps.utils.models.base import CompanyScopedModel


class SalesReturn(CompanyScopedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        RECEIVED = "received", "Received"

    return_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(
        "sales.Customer",
        on_delete=models.PROTECT,
        related_name="sales_returns",
    )
    sales_order = models.ForeignKey(
        "sales.SalesOrder",
        on_delete=models.PROTECT,
        related_name="returns",
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
        related_name="created_sales_returns",
    )

    class Meta(CompanyScopedModel.Meta):
        ordering = ["-date"]

    def __str__(self):
        return self.return_number

    def save(self, *args, **kwargs):
        if not self.return_number:
            self.return_number = self._generate_number()
        super().save(*args, **kwargs)

    def _generate_number(self):
        from django.utils import timezone

        prefix = "SR"
        year = timezone.now().strftime("%Y")
        last = (
            SalesReturn.objects.filter(return_number__startswith=f"{prefix}-{year}")
            .order_by("-return_number")
            .first()
        )
        if last:
            seq = int(last.return_number.split("-")[-1]) + 1
        else:
            seq = 1
        return f"{prefix}-{year}-{seq:05d}"
