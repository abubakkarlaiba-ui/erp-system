from django.db import models

from apps.utils.models.base import CompanyScopedModel


class Contract(CompanyScopedModel):
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="contracts",
    )

    class ContractType(models.TextChoices):
        PERMANENT = "permanent", "Permanent"
        CONTRACT = "contract", "Contract"
        INTERN = "intern", "Intern"
        FREELANCE = "freelance", "Freelance"

    contract_type = models.CharField(max_length=15, choices=ContractType.choices)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    designation = models.CharField(max_length=255)
    salary = models.DecimalField(max_digits=12, decimal_places=2)
    terms = models.TextField(null=True, blank=True)

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        EXPIRED = "expired", "Expired"
        TERMINATED = "terminated", "Terminated"

    status = models.CharField(max_length=15, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        ordering = ["-start_date"]
        verbose_name = "contract"
        verbose_name_plural = "contracts"

    def __str__(self):
        return f"{self.employee} - {self.contract_type} ({self.start_date})"
