from django.conf import settings
from django.db import models

from apps.utils.models.base import CompanyScopedModel


class Lead(CompanyScopedModel):
    class Source(models.TextChoices):
        WEBSITE = "website", "Website"
        REFERRAL = "referral", "Referral"
        COLD_CALL = "cold_call", "Cold Call"
        SOCIAL_MEDIA = "social_media", "Social Media"
        ADVERTISEMENT = "advertisement", "Advertisement"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        QUALIFIED = "qualified", "Qualified"
        CONVERTED = "converted", "Converted"
        LOST = "lost", "Lost"

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    company_name = models.CharField(max_length=255, null=True, blank=True)
    source = models.CharField(
        max_length=20,
        choices=Source.choices,
        default=Source.OTHER,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_leads",
    )
    notes = models.TextField(null=True, blank=True)
    value = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta(CompanyScopedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
