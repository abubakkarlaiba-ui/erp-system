from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.companies.views.company_views import (
    CompanyViewSet,
    BranchViewSet,
    DepartmentViewSet,
    DesignationViewSet,
    FiscalYearViewSet,
    HolidayViewSet,
    CompanyPolicyViewSet,
)

router = DefaultRouter()
router.register(r"companies", CompanyViewSet, basename="company")

company_router = DefaultRouter()
company_router.register(r"branches", BranchViewSet, basename="branch")
company_router.register(r"departments", DepartmentViewSet, basename="department")
company_router.register(r"designations", DesignationViewSet, basename="designation")
company_router.register(r"fiscal-years", FiscalYearViewSet, basename="fiscal-year")
company_router.register(r"holidays", HolidayViewSet, basename="holiday")
company_router.register(r"policies", CompanyPolicyViewSet, basename="policy")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "companies/<uuid:company_pk>/",
        include(company_router.urls),
    ),
]
