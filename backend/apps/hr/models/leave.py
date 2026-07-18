from django.conf import settings
from django.db import models
from apps.utils.models.base import CompanyScopedModel
from apps.utils.enums import LeaveStatus


class LeaveType(CompanyScopedModel):
    name = models.CharField(max_length=100)
    days_allowed = models.PositiveIntegerField()
    is_paid = models.BooleanField(default=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    is_carry_forward = models.BooleanField(default=False)
    max_carry_forward_days = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Leave Types"
        ordering = ["name"]

    def __str__(self):
        return self.name


class LeaveRequest(CompanyScopedModel):
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="leave_requests",
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        related_name="requests",
    )
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=LeaveStatus.choices,
        default=LeaveStatus.PENDING,
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_leaves",
    )
    approval_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)
    total_days = models.PositiveIntegerField()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.start_date} to {self.end_date})"


class HolidayCalendar(CompanyScopedModel):
    holiday = models.ForeignKey(
        "companies.Holiday",
        on_delete=models.CASCADE,
        related_name="hr_calendars",
    )
    branch = models.ForeignKey(
        "companies.Branch",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="holiday_calendars",
    )

    class Meta:
        verbose_name_plural = "Holiday Calendars"

    def __str__(self):
        return str(self.holiday)
