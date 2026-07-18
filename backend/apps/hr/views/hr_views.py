from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

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
from apps.hr.serializers.hr_serializers import (
    AttendanceSerializer,
    LeaveTypeSerializer,
    LeaveRequestSerializer,
    HolidayCalendarSerializer,
    PayrollPeriodSerializer,
    SalaryStructureSerializer,
    PayslipSerializer,
    BonusSerializer,
    ShiftSerializer,
    EmployeeShiftSerializer,
    TrainingSerializer,
    TrainingAssignmentSerializer,
    PerformanceReviewSerializer,
    OvertimeSerializer,
)


class CompanyFilteredViewSetMixin:
    def get_queryset(self):
        return self.queryset.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class AttendanceViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("employee").all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["employee", "date", "status"]
    search_fields = ["employee__first_name", "employee__last_name"]
    ordering_fields = ["date", "status"]


class LeaveTypeViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["is_paid", "is_carry_forward"]
    search_fields = ["name"]
    ordering_fields = ["name", "days_allowed"]


class LeaveRequestViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related(
        "employee", "leave_type", "approved_by"
    ).all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["employee", "leave_type", "status"]
    search_fields = ["employee__first_name", "employee__last_name"]
    ordering_fields = ["start_date", "status"]


class HolidayCalendarViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = HolidayCalendar.objects.select_related("holiday", "branch").all()
    serializer_class = HolidayCalendarSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["holiday", "branch"]
    ordering_fields = ["created_at"]


class PayrollPeriodViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = PayrollPeriod.objects.select_related("processed_by").all()
    serializer_class = PayrollPeriodSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status"]
    search_fields = ["name"]
    ordering_fields = ["start_date", "status"]


class SalaryStructureViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = SalaryStructure.objects.all()
    serializer_class = SalaryStructureSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["name"]
    ordering_fields = ["name", "basic_salary"]


class PayslipViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = Payslip.objects.select_related("employee", "period").all()
    serializer_class = PayslipSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["employee", "period", "status"]
    search_fields = ["employee__first_name", "employee__last_name"]
    ordering_fields = ["created_at", "status", "net_salary"]


class BonusViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = Bonus.objects.select_related("employee", "approved_by").all()
    serializer_class = BonusSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["employee", "bonus_type"]
    search_fields = ["employee__first_name", "employee__last_name"]
    ordering_fields = ["date", "amount"]


class ShiftViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["is_active"]
    search_fields = ["name"]
    ordering_fields = ["start_time", "name"]


class EmployeeShiftViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = EmployeeShift.objects.select_related("employee", "shift").all()
    serializer_class = EmployeeShiftSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["employee", "shift", "date"]
    search_fields = ["employee__first_name", "employee__last_name"]
    ordering_fields = ["date"]


class TrainingViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status"]
    search_fields = ["title", "trainer"]
    ordering_fields = ["start_date", "status"]


class TrainingAssignmentViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = TrainingAssignment.objects.select_related(
        "training", "employee"
    ).all()
    serializer_class = TrainingAssignmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["training", "employee", "status"]
    search_fields = ["employee__first_name", "employee__last_name"]
    ordering_fields = ["status", "completion_date"]


class PerformanceReviewViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.select_related(
        "employee", "reviewer"
    ).all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["employee", "reviewer", "status"]
    search_fields = ["employee__first_name", "employee__last_name"]
    ordering_fields = ["review_period_end", "overall_rating", "status"]


class OvertimeViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = Overtime.objects.select_related("employee", "approved_by").all()
    serializer_class = OvertimeSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["employee", "status", "date"]
    search_fields = ["employee__first_name", "employee__last_name"]
    ordering_fields = ["date", "hours", "status"]
