from django.db import models

from apps.utils.enums import EmployeeStatus
from apps.utils.models.base import CompanyScopedModel


class Employee(CompanyScopedModel):
    user = models.OneToOneField(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employee_profile",
    )
    employee_id = models.CharField(max_length=50)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, default="")
    date_of_birth = models.DateField(null=True, blank=True)

    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"

    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True, default="")

    class BloodGroup(models.TextChoices):
        A_POSITIVE = "a_positive", "A+"
        A_NEGATIVE = "a_negative", "A-"
        B_POSITIVE = "b_positive", "B+"
        B_NEGATIVE = "b_negative", "B-"
        O_POSITIVE = "o_positive", "O+"
        O_NEGATIVE = "o_negative", "O-"
        AB_POSITIVE = "ab_positive", "AB+"
        AB_NEGATIVE = "ab_negative", "AB-"

    blood_group = models.CharField(max_length=15, choices=BloodGroup.choices, null=True, blank=True)

    class MaritalStatus(models.TextChoices):
        SINGLE = "single", "Single"
        MARRIED = "married", "Married"
        DIVORCED = "divorced", "Divorced"
        WIDOWED = "widowed", "Widowed"

    marital_status = models.CharField(max_length=10, choices=MaritalStatus.choices, null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True, default="")

    address_line1 = models.CharField(max_length=255, blank=True, default="")
    address_line2 = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    state = models.CharField(max_length=100, blank=True, default="")
    country = models.CharField(max_length=100, blank=True, default="")
    postal_code = models.CharField(max_length=20, blank=True, default="")

    branch = models.ForeignKey(
        "companies.Branch",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees",
    )
    department = models.ForeignKey(
        "companies.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees",
    )
    designation = models.ForeignKey(
        "companies.Designation",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees",
    )
    manager = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subordinates",
    )

    joining_date = models.DateField()
    confirmation_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=15,
        choices=EmployeeStatus.choices,
        default=EmployeeStatus.ACTIVE,
    )
    profile_photo = models.ImageField(upload_to="employee_photos/", null=True, blank=True)

    emergency_contact_name = models.CharField(max_length=255, blank=True, default="")
    emergency_contact_phone = models.CharField(max_length=20, blank=True, default="")
    emergency_contact_relationship = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        unique_together = [("company", "employee_id")]
        ordering = ["-joining_date"]
        verbose_name = "employee"
        verbose_name_plural = "employees"

    def __str__(self):
        return f"{self.employee_id} - {self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
