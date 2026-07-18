from apps.utils.models.base import CompanyScopedModel


class FiscalYear(CompanyScopedModel):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ["-start_date"]
        verbose_name_plural = "fiscal years"

    def __str__(self):
        return f"{self.company.name} - {self.name}"

    def save(self, *args, **kwargs):
        if self.is_current:
            FiscalYear.objects.filter(
                company=self.company, is_current=True
            ).exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)
