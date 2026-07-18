from django.db import models


class Promotion(models.Model):
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="promotions",
    )
    old_designation = models.CharField(max_length=255)
    new_designation = models.CharField(max_length=255)
    promotion_date = models.DateField()
    salary_before = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_after = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    reason = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-promotion_date"]
        verbose_name = "promotion"
        verbose_name_plural = "promotions"

    def __str__(self):
        return f"{self.employee} - {self.old_designation} to {self.new_designation}"
