from rest_framework import serializers
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


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)

    class Meta:
        model = Attendance
        fields = [
            "id",
            "company",
            "employee",
            "employee_name",
            "date",
            "check_in",
            "check_out",
            "status",
            "hours_worked",
            "overtime_hours",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = [
            "id",
            "company",
            "name",
            "days_allowed",
            "is_paid",
            "description",
            "is_carry_forward",
            "max_carry_forward_days",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    leave_type_name = serializers.CharField(
        source="leave_type.name", read_only=True
    )
    approved_by_name = serializers.CharField(
        source="approved_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "company",
            "employee",
            "employee_name",
            "leave_type",
            "leave_type_name",
            "start_date",
            "end_date",
            "reason",
            "status",
            "approved_by",
            "approved_by_name",
            "approval_date",
            "rejection_reason",
            "total_days",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class HolidayCalendarSerializer(serializers.ModelSerializer):
    holiday_name = serializers.CharField(source="holiday.name", read_only=True)
    branch_name = serializers.CharField(
        source="branch.name", read_only=True, default=None
    )

    class Meta:
        model = HolidayCalendar
        fields = [
            "id",
            "company",
            "holiday",
            "holiday_name",
            "branch",
            "branch_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PayrollPeriodSerializer(serializers.ModelSerializer):
    processed_by_name = serializers.CharField(
        source="processed_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = PayrollPeriod
        fields = [
            "id",
            "company",
            "name",
            "start_date",
            "end_date",
            "status",
            "processed_by",
            "processed_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SalaryStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryStructure
        fields = [
            "id",
            "company",
            "name",
            "description",
            "basic_salary",
            "house_allowance",
            "transport_allowance",
            "medical_allowance",
            "other_allowances",
            "tax_rate",
            "pension_rate",
            "insurance_rate",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PayslipSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    period_name = serializers.CharField(source="period.name", read_only=True)

    class Meta:
        model = Payslip
        fields = [
            "id",
            "company",
            "employee",
            "employee_name",
            "period",
            "period_name",
            "basic_salary",
            "allowances",
            "gross_salary",
            "tax_deduction",
            "pension_deduction",
            "insurance_deduction",
            "other_deductions",
            "net_salary",
            "status",
            "paid_date",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class BonusSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    approved_by_name = serializers.CharField(
        source="approved_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = Bonus
        fields = [
            "id",
            "company",
            "employee",
            "employee_name",
            "bonus_type",
            "amount",
            "date",
            "reason",
            "approved_by",
            "approved_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = [
            "id",
            "company",
            "name",
            "start_time",
            "end_time",
            "is_active",
            "break_duration",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class EmployeeShiftSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    shift_name = serializers.CharField(source="shift.name", read_only=True)

    class Meta:
        model = EmployeeShift
        fields = [
            "id",
            "company",
            "employee",
            "employee_name",
            "shift",
            "shift_name",
            "date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = [
            "id",
            "company",
            "title",
            "description",
            "trainer",
            "start_date",
            "end_date",
            "location",
            "max_participants",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TrainingAssignmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    training_title = serializers.CharField(
        source="training.title", read_only=True
    )

    class Meta:
        model = TrainingAssignment
        fields = [
            "id",
            "company",
            "training",
            "training_title",
            "employee",
            "employee_name",
            "status",
            "completion_date",
            "certificate",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    reviewer_name = serializers.CharField(
        source="reviewer.get_full_name", read_only=True
    )

    class Meta:
        model = PerformanceReview
        fields = [
            "id",
            "company",
            "employee",
            "employee_name",
            "reviewer",
            "reviewer_name",
            "review_period_start",
            "review_period_end",
            "overall_rating",
            "technical_skills",
            "communication",
            "teamwork",
            "leadership",
            "goals_met",
            "strengths",
            "improvements",
            "comments",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class OvertimeSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    approved_by_name = serializers.CharField(
        source="approved_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = Overtime
        fields = [
            "id",
            "company",
            "employee",
            "employee_name",
            "date",
            "hours",
            "reason",
            "status",
            "approved_by",
            "approved_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
