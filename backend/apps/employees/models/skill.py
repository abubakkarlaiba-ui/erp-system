from django.db import models


class Skill(models.Model):
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="skills",
    )
    name = models.CharField(max_length=255)

    class Proficiency(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"
        EXPERT = "expert", "Expert"

    proficiency = models.CharField(max_length=15, choices=Proficiency.choices)
    years_of_experience = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["name"]
        unique_together = [("employee", "name")]
        verbose_name = "skill"
        verbose_name_plural = "skills"

    def __str__(self):
        return f"{self.employee} - {self.name}"
