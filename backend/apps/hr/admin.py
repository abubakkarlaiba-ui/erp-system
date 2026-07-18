from django.contrib import admin

from apps.hr.models import (
    Attendance,
    LeaveType,
    LeaveRequest,
    HolidayCalendar,
    PayrollPeriod,
    SalaryStructure,
    Payslip,
    Bonus,
    Shift,
    EmployeeShift,
    Training,
    TrainingAssignment,
    PerformanceReview,
    Overtime,
)


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = [
        "employee",
        "date",
        "status",
        "check_in",
        "check_out",
        "hours_worked",
        "overtime_hours",
    ]
    list_filter = ["status", "date"]
    search_fields = [
        "employee__first_name",
        "employee__last_name",
    ]


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "days_allowed",
        "is_paid",
        "is_carry_forward",
        "max_carry_forward_days",
    ]
    list_filter = ["is_paid", "is_carry_forward"]
    search_fields = ["name"]


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = [
        "employee",
        "leave_type",
        "start_date",
        "end_date",
        "total_days",
        "status",
    ]
    list_filter = ["status", "leave_type"]
    search_fields = [
        "employee__first_name",
        "employee__last_name",
    ]


@admin.register(HolidayCalendar)
class HolidayCalendarAdmin(admin.ModelAdmin):
    list_display = ["holiday", "branch"]
    list_filter = ["branch"]


@admin.register(PayrollPeriod)
class PayrollPeriodAdmin(admin.ModelAdmin):
    list_display = ["name", "start_date", "end_date", "status", "processed_by"]
    list_filter = ["status"]
    search_fields = ["name"]


@admin.register(SalaryStructure)
class SalaryStructureAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "basic_salary",
        "house_allowance",
        "transport_allowance",
        "medical_allowance",
        "other_allowances",
    ]
    search_fields = ["name"]


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = [
        "employee",
        "period",
        "gross_salary",
        "net_salary",
        "status",
        "paid_date",
    ]
    list_filter = ["status"]
    search_fields = [
        "employee__first_name",
        "employee__last_name",
    ]


@admin.register(Bonus)
class BonusAdmin(admin.ModelAdmin):
    list_display = [
        "employee",
        "bonus_type",
        "amount",
        "date",
        "approved_by",
    ]
    list_filter = ["bonus_type"]
    search_fields = [
        "employee__first_name",
        "employee__last_name",
    ]


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ["name", "start_time", "end_time", "is_active", "break_duration"]
    list_filter = ["is_active"]
    search_fields = ["name"]


@admin.register(EmployeeShift)
class EmployeeShiftAdmin(admin.ModelAdmin):
    list_display = ["employee", "shift", "date"]
    list_filter = ["shift", "date"]
    search_fields = [
        "employee__first_name",
        "employee__last_name",
    ]


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "trainer",
        "start_date",
        "end_date",
        "location",
        "status",
    ]
    list_filter = ["status"]
    search_fields = ["title", "trainer"]


@admin.register(TrainingAssignment)
class TrainingAssignmentAdmin(admin.ModelAdmin):
    list_display = [
        "training",
        "employee",
        "status",
        "completion_date",
    ]
    list_filter = ["status"]
    search_fields = [
        "employee__first_name",
        "employee__last_name",
    ]


@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = [
        "employee",
        "reviewer",
        "review_period_start",
        "review_period_end",
        "overall_rating",
        "status",
    ]
    list_filter = ["status"]
    search_fields = [
        "employee__first_name",
        "employee__last_name",
    ]


@admin.register(Overtime)
class OvertimeAdmin(admin.ModelAdmin):
    list_display = [
        "employee",
        "date",
        "hours",
        "status",
        "approved_by",
    ]
    list_filter = ["status"]
    search_fields = [
        "employee__first_name",
        "employee__last_name",
    ]
