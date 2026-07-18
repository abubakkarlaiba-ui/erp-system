from django.conf import settings
from django.db import models

from apps.utils.models.base import CompanyScopedModel


class Opportunity(CompanyScopedModel):
    class Stage(models.TextChoices):
        PROSPECTING = "prospecting", "Prospecting"
        QUALIFICATION = "qualification", "Qualification"
        PROPOSAL = "proposal", "Proposal"
        NEGOTIATION = "negotiation", "Negotiation"
        CLOSED_WON = "closed_won", "Closed Won"
        CLOSED_LOST = "closed_lost", "Closed Lost"

    title = models.CharField(max_length=255)
    lead = models.ForeignKey(
        "sales.Lead",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="opportunities",
    )
    customer = models.ForeignKey(
        "sales.Customer",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="opportunities",
    )
    value = models.DecimalField(max_digits=12, decimal_places=2)
    stage = models.CharField(
        max_length=20,
        choices=Stage.choices,
        default=Stage.PROSPECTING,
    )
    expected_close_date = models.DateField(null=True, blank=True)
    actual_close_date = models.DateField(null=True, blank=True)
    probability = models.IntegerField(default=0)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_opportunities",
    )
    notes = models.TextField(null=True, blank=True)

    class Meta(CompanyScopedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
