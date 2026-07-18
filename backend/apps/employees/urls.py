from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.employees.views.employee_views import (
    ContractViewSet,
    EducationViewSet,
    EmployeeDocumentViewSet,
    EmployeeViewSet,
    ExperienceViewSet,
    PromotionViewSet,
    ResignationViewSet,
    SkillViewSet,
    TerminationViewSet,
    TransferViewSet,
)

router = DefaultRouter()
router.register("employees", EmployeeViewSet, basename="employee")
router.register("documents", EmployeeDocumentViewSet, basename="employee-document")
router.register("contracts", ContractViewSet, basename="contract")
router.register("education", EducationViewSet, basename="education")
router.register("experience", ExperienceViewSet, basename="experience")
router.register("skills", SkillViewSet, basename="skill")
router.register("promotions", PromotionViewSet, basename="promotion")
router.register("transfers", TransferViewSet, basename="transfer")
router.register("resignations", ResignationViewSet, basename="resignation")
router.register("terminations", TerminationViewSet, basename="termination")

urlpatterns = [
    path("", include(router.urls)),
]
