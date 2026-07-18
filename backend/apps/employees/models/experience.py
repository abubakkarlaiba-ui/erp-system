from django.db import models


class Experience(models.Model):
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="experience",
    )
    company_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-start_date"]
        verbose_name = "experience"
        verbose_name_plural = "experience"

    def __str__(self):
        return f"{self.employee} - {self.designation} at {self.company_name}"
