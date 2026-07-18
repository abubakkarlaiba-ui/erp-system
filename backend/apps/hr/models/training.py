from django.db import models
from apps.utils.models.base import CompanyScopedModel


class Training(CompanyScopedModel):
    TRAINING_STATUS = [
        ("draft", "Draft"),
        ("scheduled", "Scheduled"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    trainer = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    location = models.CharField(max_length=200, null=True, blank=True)
    max_participants = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=TRAINING_STATUS,
        default="draft",
    )

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return self.title


class TrainingAssignment(CompanyScopedModel):
    ASSIGNMENT_STATUS = [
        ("assigned", "Assigned"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("dropped", "Dropped"),
    ]

    training = models.ForeignKey(
        Training,
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="training_assignments",
    )
    status = models.CharField(
        max_length=20,
        choices=ASSIGNMENT_STATUS,
        default="assigned",
    )
    completion_date = models.DateField(null=True, blank=True)
    certificate = models.ImageField(
        upload_to="training/certificates/",
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.employee} - {self.training}"
