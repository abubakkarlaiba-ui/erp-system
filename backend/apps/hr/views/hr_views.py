from decimal import Decimal

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
from apps.hr.models import (
    JobPosting,
    Applicant,
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
    JobPostingSerializer,
    ApplicantSerializer,
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

    def _get_employee(self, request):
        user = request.user
        if hasattr(user, "employee_profile"):
            return user.employee_profile
        from apps.employees.models import Employee
        emp = Employee.objects.filter(company=user.company).first()
        return emp

    @action(detail=False, methods=["post"], url_path="clock-in")
    def clock_in(self, request):
        user = request.user
        today = timezone.now().date()
        now_time = timezone.now().time()
        employee = self._get_employee(request)
        if not employee:
            return Response({"detail": "No employee profile found."}, status=status.HTTP_400_BAD_REQUEST)
        attendance, created = Attendance.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={"company": user.company, "check_in": now_time, "status": "present"},
        )
        if not created:
            attendance.check_in = now_time
            attendance.status = "present"
            attendance.save(update_fields=["check_in", "status"])
        return Response(AttendanceSerializer(attendance).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="clock-out")
    def clock_out(self, request):
        user = request.user
        today = timezone.now().date()
        now_time = timezone.now().time()
        employee = self._get_employee(request)
        if not employee:
            return Response({"detail": "No employee profile found."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
        except Attendance.DoesNotExist:
            return Response({"detail": "No clock-in record found for today."}, status=status.HTTP_400_BAD_REQUEST)
        attendance.check_out = now_time
        if attendance.check_in:
            from datetime import datetime
            check_in_dt = datetime.combine(today, attendance.check_in)
            check_out_dt = datetime.combine(today, now_time)
            diff = check_out_dt - check_in_dt
            attendance.hours_worked = round(diff.total_seconds() / 3600, 2)
        attendance.save(update_fields=["check_out", "hours_worked"])
        return Response(AttendanceSerializer(attendance).data, status=status.HTTP_200_OK)


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

    def perform_create(self, serializer):
        from apps.employees.models import Employee
        employee = Employee.objects.filter(user=self.request.user).first()
        company = self.request.user.company or (employee.company if employee else None)
        if employee:
            serializer.save(employee=employee, company=company)
        else:
            serializer.save(company=company)

    @action(detail=True, methods=["put"])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = "approved"
        leave.approved_by = request.user
        leave.approval_date = timezone.now()
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)

    @action(detail=True, methods=["put"])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = "rejected"
        leave.rejection_reason = request.data.get("reason", "")
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)

    @action(detail=False, methods=["get"], url_path="balance/(?P<employee_id>[^/.]+)")
    def balance(self, request, employee_id=None):
        from datetime import date
        from django.db.models import Sum
        year = date.today().year
        leave_types = LeaveType.objects.filter(company=request.user.company)
        balances = []
        for lt in leave_types:
            used = LeaveRequest.objects.filter(
                leave_type=lt,
                status="approved",
                start_date__year=year,
            ).aggregate(total=Sum("total_days"))["total"] or 0
            balances.append({
                "leaveType": lt.name,
                "allowed": lt.days_allowed,
                "used": int(used),
                "remaining": lt.days_allowed - int(used),
            })
        return Response({"balances": balances})


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

    @action(detail=False, methods=["post"])
    def generate(self, request):
        period_id = request.data.get("period")
        if not period_id:
            return Response({"error": "period is required"}, status=400)
        try:
            period = PayrollPeriod.objects.get(id=period_id)
        except PayrollPeriod.DoesNotExist:
            return Response({"error": "Period not found"}, status=404)

        from apps.employees.models import Employee
        user = request.user
        employees = Employee.objects.filter(company=user.company, status="active") if user.company else Employee.objects.filter(status="active")

        created = 0
        for emp in employees:
            if Payslip.objects.filter(employee=emp, period=period).exists():
                continue
            salary = emp.salary or 0
            allowances = salary * Decimal("0.15")
            gross = salary + allowances
            tax = gross * Decimal("0.10")
            pension = gross * Decimal("0.05")
            insurance = gross * Decimal("0.02")
            other = Decimal("0")
            net = gross - tax - pension - insurance - other
            Payslip.objects.create(
                employee=emp,
                period=period,
                company=user.company,
                basic_salary=salary,
                allowances=allowances,
                gross_salary=gross,
                tax_deduction=tax,
                pension_deduction=pension,
                insurance_deduction=insurance,
                other_deductions=other,
                net_salary=net,
                status="draft",
            )
            created += 1

        return Response({"message": f"{created} payslips generated", "count": created})


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


class JobPostingViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = JobPosting.objects.select_related("posted_by").all()
    serializer_class = JobPostingSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status", "department", "employment_type"]
    search_fields = ["title", "department", "location"]
    ordering_fields = ["created_at", "title", "status"]

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(company=user.company, posted_by=user)


class ApplicantViewSet(CompanyFilteredViewSetMixin, viewsets.ModelViewSet):
    queryset = Applicant.objects.select_related("job").all()
    serializer_class = ApplicantSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["job", "status", "department"]
    search_fields = ["first_name", "last_name", "email", "position"]
    ordering_fields = ["applied_date", "status", "created_at"]
