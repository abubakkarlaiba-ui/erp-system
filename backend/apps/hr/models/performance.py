from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from apps.utils.models.base import CompanyScopedModel


class PerformanceReview(CompanyScopedModel):
    REVIEW_STATUS = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("acknowledged", "Acknowledged"),
    ]

    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="performance_reviews",
    )
    reviewer = models.ForeignKey(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="conducted_reviews",
    )
    review_period_start = models.DateField()
    review_period_end = models.DateField()
    overall_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    technical_skills = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    communication = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    teamwork = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    leadership = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    goals_met = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    strengths = models.TextField(null=True, blank=True)
    improvements = models.TextField(null=True, blank=True)
    comments = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=REVIEW_STATUS,
        default="draft",
    )

    class Meta:
        ordering = ["-review_period_end"]

    def __str__(self):
        return f"{self.employee} - {self.review_period_start} to {self.review_period_end}"
