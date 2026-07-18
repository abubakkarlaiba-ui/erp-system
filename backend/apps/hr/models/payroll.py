from django.db import models
from apps.utils.models.base import CompanyScopedModel


class PayrollPeriod(CompanyScopedModel):
    PERIOD_STATUS = [
        ("draft", "Draft"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("closed", "Closed"),
    ]

    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=PERIOD_STATUS,
        default="draft",
    )
    processed_by = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="processed_payrolls",
    )

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return self.name


class SalaryStructure(CompanyScopedModel):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, null=True, blank=True)
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    house_allowance = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    transport_allowance = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    medical_allowance = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    other_allowances = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    pension_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    insurance_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=0
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Payslip(CompanyScopedModel):
    PAYSLIP_STATUS = [
        ("draft", "Draft"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
    ]

    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="payslips",
    )
    period = models.ForeignKey(
        PayrollPeriod,
        on_delete=models.CASCADE,
        related_name="payslips",
    )
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    allowances = models.DecimalField(max_digits=12, decimal_places=2)
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2)
    tax_deduction = models.DecimalField(max_digits=12, decimal_places=2)
    pension_deduction = models.DecimalField(max_digits=12, decimal_places=2)
    insurance_deduction = models.DecimalField(max_digits=12, decimal_places=2)
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=PAYSLIP_STATUS,
        default="draft",
    )
    paid_date = models.DateField(null=True, blank=True)
    notes = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payslip - {self.employee} - {self.period}"


class Bonus(CompanyScopedModel):
    BONUS_TYPE = [
        ("performance", "Performance"),
        ("festival", "Festival"),
        ("retention", "Retention"),
        ("other", "Other"),
    ]

    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="bonuses",
    )
    bonus_type = models.CharField(max_length=20, choices=BONUS_TYPE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    reason = models.TextField(null=True, blank=True)
    approved_by = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_bonuses",
    )

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.employee} - {self.bonus_type} - {self.amount}"
