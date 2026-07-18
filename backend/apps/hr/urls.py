from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.hr.views.hr_views import (
    AttendanceViewSet,
    LeaveTypeViewSet,
    LeaveRequestViewSet,
    HolidayCalendarViewSet,
    PayrollPeriodViewSet,
    SalaryStructureViewSet,
    PayslipViewSet,
    BonusViewSet,
    ShiftViewSet,
    EmployeeShiftViewSet,
    TrainingViewSet,
    TrainingAssignmentViewSet,
    PerformanceReviewViewSet,
    OvertimeViewSet,
)

router = DefaultRouter()
router.register(r"attendance", AttendanceViewSet, basename="attendance")
router.register(r"leave-types", LeaveTypeViewSet, basename="leave-types")
router.register(r"leave-requests", LeaveRequestViewSet, basename="leave-requests")
router.register(
    r"holiday-calendars", HolidayCalendarViewSet, basename="holiday-calendars"
)
router.register(r"payroll-periods", PayrollPeriodViewSet, basename="payroll-periods")
router.register(
    r"salary-structures", SalaryStructureViewSet, basename="salary-structures"
)
router.register(r"payslips", PayslipViewSet, basename="payslips")
router.register(r"bonuses", BonusViewSet, basename="bonuses")
router.register(r"shifts", ShiftViewSet, basename="shifts")
router.register(r"employee-shifts", EmployeeShiftViewSet, basename="employee-shifts")
router.register(r"trainings", TrainingViewSet, basename="trainings")
router.register(
    r"training-assignments",
    TrainingAssignmentViewSet,
    basename="training-assignments",
)
router.register(
    r"performance-reviews",
    PerformanceReviewViewSet,
    basename="performance-reviews",
)
router.register(r"overtimes", OvertimeViewSet, basename="overtimes")

urlpatterns = [
    path("", include(router.urls)),
]
