from django.db import models

from apps.utils.models.base import CompanyScopedModel


class EmployeeDocument(CompanyScopedModel):
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="documents",
    )
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=500, blank=True, default="")

    class DocumentType(models.TextChoices):
        CONTRACT = "contract", "Contract"
        CERTIFICATE = "certificate", "Certificate"
        ID_PROOF = "id_proof", "ID Proof"
        ADDRESS_PROOF = "address_proof", "Address Proof"
        EDUCATION = "education", "Education"
        EXPERIENCE = "experience", "Experience"
        OTHER = "other", "Other"

    document_type = models.CharField(max_length=20, choices=DocumentType.choices)
    file = models.FileField(upload_to="employee_documents/")
    expiry_date = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "employee document"
        verbose_name_plural = "employee documents"

    def __str__(self):
        return f"{self.employee} - {self.title}"
