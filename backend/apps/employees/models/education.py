from django.db import models


class Education(models.Model):
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="education",
    )
    institution_name = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    field_of_study = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    grade = models.CharField(max_length=50, blank=True, default="")
    description = models.CharField(max_length=500, blank=True, default="")

    class Meta:
        ordering = ["-start_date"]
        verbose_name = "education"
        verbose_name_plural = "education"

    def __str__(self):
        return f"{self.employee} - {self.degree} at {self.institution_name}"
