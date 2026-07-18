from django.db import models


class Transfer(models.Model):
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="transfers",
    )
    from_branch = models.ForeignKey(
        "companies.Branch",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transfers_from",
    )
    to_branch = models.ForeignKey(
        "companies.Branch",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transfers_to",
    )
    from_department = models.ForeignKey(
        "companies.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transfers_from",
    )
    to_department = models.ForeignKey(
        "companies.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transfers_to",
    )
    transfer_date = models.DateField()
    reason = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-transfer_date"]
        verbose_name = "transfer"
        verbose_name_plural = "transfers"

    def __str__(self):
        return f"{self.employee} - Transfer on {self.transfer_date}"
