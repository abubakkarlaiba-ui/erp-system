from django.db import models

from apps.utils.models.base import CompanyScopedModel


class JobPosting(CompanyScopedModel):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("open", "Open"),
        ("closed", "Closed"),
        ("cancelled", "Cancelled"),
    ]

    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100, blank=True, default="")
    description = models.TextField(blank=True, default="")
    location = models.CharField(max_length=200, blank=True, default="")
    employment_type = models.CharField(
        max_length=20,
        choices=[
            ("full_time", "Full Time"),
            ("part_time", "Part Time"),
            ("contract", "Contract"),
            ("intern", "Intern"),
        ],
        default="full_time",
    )
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    openings = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    posted_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posted_jobs",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Applicant(CompanyScopedModel):
    STATUS_CHOICES = [
        ("applied", "Applied"),
        ("screening", "Screening"),
        ("interview", "Interview"),
        ("offer", "Offer"),
        ("hired", "Hired"),
        ("rejected", "Rejected"),
    ]

    job = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name="applicants",
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True, default="")
    position = models.CharField(max_length=200, blank=True, default="")
    department = models.CharField(max_length=100, blank=True, default="")
    applied_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="applied")
    experience = models.CharField(max_length=100, blank=True, default="")
    education = models.CharField(max_length=200, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    resume_url = models.URLField(blank=True, default="")

    class Meta:
        ordering = ["-applied_date"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
