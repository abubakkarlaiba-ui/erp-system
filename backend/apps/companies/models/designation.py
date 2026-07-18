from apps.utils.models.base import CompanyScopedModel


class Designation(CompanyScopedModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    department = models.ForeignKey(
        "companies.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="designations",
    )
    level = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = [("company", "code")]
        ordering = ["level", "name"]

    def __str__(self):
        return f"{self.company.name} - {self.name}"
