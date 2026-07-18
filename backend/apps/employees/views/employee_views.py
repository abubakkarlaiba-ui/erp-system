from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.employees.models import (
    Contract,
    Education,
    Employee,
    EmployeeDocument,
    Experience,
    Promotion,
    Resignation,
    Skill,
    Termination,
    Transfer,
)
from apps.employees.serializers import (
    ContractSerializer,
    EducationSerializer,
    EmployeeDetailSerializer,
    EmployeeDocumentSerializer,
    EmployeeListSerializer,
    ExperienceSerializer,
    PromotionSerializer,
    ResignationSerializer,
    SkillSerializer,
    TerminationSerializer,
    TransferSerializer,
)
from apps.utils.permissions import HasModulePermission, IsSameCompany


class EmployeeViewSet(viewsets.ModelViewSet):
    permission_module = "employees"
    permission_classes = [permissions.IsAuthenticated, HasModulePermission, IsSameCompany]
    search_fields = ["employee_id", "first_name", "last_name", "email", "phone"]
    ordering_fields = [
        "employee_id", "first_name", "last_name", "joining_date", "status", "created_at",
    ]
    filterset_fields = [
        "status", "department", "designation", "branch", "manager",
    ]

    def get_serializer_class(self):
        if self.action == "list":
            return EmployeeListSerializer
        return EmployeeDetailSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Employee.objects.select_related(
                "department", "designation", "branch", "manager", "user",
            ).prefetch_related(
                "education", "experience", "skills", "documents",
                "contracts", "promotions", "transfers", "resignations", "terminations",
            ).all()
        if user.company:
            return Employee.objects.select_related(
                "department", "designation", "branch", "manager", "user",
            ).prefetch_related(
                "education", "experience", "skills", "documents",
                "contracts", "promotions", "transfers", "resignations", "terminations",
            ).filter(company=user.company)
        return Employee.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_superuser and user.company:
            serializer.save(company=user.company)
        else:
            serializer.save()

    @action(detail=True, methods=["get"])
    def documents(self, request, pk=None):
        employee = self.get_object()
        qs = employee.documents.all()
        serializer = EmployeeDocumentSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def contracts(self, request, pk=None):
        employee = self.get_object()
        qs = employee.contracts.all()
        serializer = ContractSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def education(self, request, pk=None):
        employee = self.get_object()
        qs = employee.education.all()
        serializer = EducationSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def experience(self, request, pk=None):
        employee = self.get_object()
        qs = employee.experience.all()
        serializer = ExperienceSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def skills(self, request, pk=None):
        employee = self.get_object()
        qs = employee.skills.all()
        serializer = SkillSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def promotions(self, request, pk=None):
        employee = self.get_object()
        qs = employee.promotions.all()
        serializer = PromotionSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def transfers(self, request, pk=None):
        employee = self.get_object()
        qs = employee.transfers.all()
        serializer = TransferSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def subordinates(self, request, pk=None):
        employee = self.get_object()
        qs = employee.subordinates.all()
        serializer = EmployeeListSerializer(qs, many=True)
        return Response(serializer.data)


class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    permission_module = "employees"
    permission_classes = [permissions.IsAuthenticated, HasModulePermission, IsSameCompany]
    serializer_class = EmployeeDocumentSerializer
    search_fields = ["title", "description"]
    ordering_fields = ["title", "document_type", "expiry_date", "created_at"]
    filterset_fields = ["employee", "document_type", "is_verified"]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return EmployeeDocument.objects.select_related("employee").all()
        if user.company:
            return EmployeeDocument.objects.select_related("employee").filter(company=user.company)
        return EmployeeDocument.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_superuser and user.company:
            serializer.save(company=user.company)
        else:
            serializer.save()


class ContractViewSet(viewsets.ModelViewSet):
    permission_module = "employees"
    permission_classes = [permissions.IsAuthenticated, HasModulePermission, IsSameCompany]
    serializer_class = ContractSerializer
    search_fields = ["employee__employee_id", "employee__first_name", "employee__last_name", "designation"]
    ordering_fields = ["start_date", "end_date", "status", "created_at"]
    filterset_fields = ["employee", "contract_type", "status"]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Contract.objects.select_related("employee").all()
        if user.company:
            return Contract.objects.select_related("employee").filter(company=user.company)
        return Contract.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_superuser and user.company:
            serializer.save(company=user.company)
        else:
            serializer.save()


class EducationViewSet(viewsets.ModelViewSet):
    permission_module = "employees"
    permission_classes = [permissions.IsAuthenticated, HasModulePermission, IsSameCompany]
    serializer_class = EducationSerializer
    search_fields = ["institution_name", "degree", "field_of_study"]
    ordering_fields = ["start_date", "end_date", "institution_name"]
    filterset_fields = ["employee"]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Education.objects.select_related("employee").all()
        if user.company:
            return Education.objects.select_related("employee").filter(
                employee__company=user.company,
            )
        return Education.objects.none()


class ExperienceViewSet(viewsets.ModelViewSet):
    permission_module = "employees"
    permission_classes = [permissions.IsAuthenticated, HasModulePermission, IsSameCompany]
    serializer_class = ExperienceSerializer
    search_fields = ["company_name", "designation"]
    ordering_fields = ["start_date", "end_date", "company_name"]
    filterset_fields = ["employee"]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Experience.objects.select_related("employee").all()
        if user.company:
            return Experience.objects.select_related("employee").filter(
                employee__company=user.company,
            )
        return Experience.objects.none()


class SkillViewSet(viewsets.ModelViewSet):
    permission_module = "employees"
    permission_classes = [permissions.IsAuthenticated, HasModulePermission, IsSameCompany]
    serializer_class = SkillSerializer
    search_fields = ["name"]
    ordering_fields = ["name", "proficiency"]
    filterset_fields = ["employee", "proficiency"]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Skill.objects.select_related("employee").all()
        if user.company:
            return Skill.objects.select_related("employee").filter(
                employee__company=user.company,
            )
        return Skill.objects.none()


class PromotionViewSet(viewsets.ModelViewSet):
    permission_module = "employees"
    permission_classes = [permissions.IsAuthenticated, HasModulePermission, IsSameCompany]
    serializer_class = PromotionSerializer
    search_fields = [
        "employee__employee_id", "employee__first_name",
        "employee__last_name", "old_designation", "new_designation",
    ]
    ordering_fields = ["promotion_date", "created_at"]
    filterset_fields = ["employee"]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Promotion.objects.select_related("employee").all()
        if user.company:
            return Promotion.objects.select_related("employee").filter(
                employee__company=user.company,
            )
        return Promotion.objects.none()


class TransferViewSet(viewsets.ModelViewSet):
    permission_module = "employees"
    permission_classes = [permissions.IsAuthenticated, HasModulePermission, IsSameCompany]
    serializer_class = TransferSerializer
    search_fields = ["employee__employee_id", "employee__first_name", "employee__last_name"]
    ordering_fields = ["transfer_date", "created_at"]
    filterset_fields = ["employee", "from_branch", "to_branch", "from_department", "to_department"]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Transfer.objects.select_related(
                "employee", "from_branch", "to_branch", "from_department", "to_department",
            ).all()
        if user.company:
            return Transfer.objects.select_related(
                "employee", "from_branch", "to_branch", "from_department", "to_department",
            ).filter(employee__company=user.company)
        return Transfer.objects.none()


class ResignationViewSet(viewsets.ModelViewSet):
    permission_module = "employees"
    permission_classes = [permissions.IsAuthenticated, HasModulePermission, IsSameCompany]
    serializer_class = ResignationSerializer
    search_fields = ["employee__employee_id", "employee__first_name", "employee__last_name"]
    ordering_fields = ["notice_date", "last_working_date", "status", "created_at"]
    filterset_fields = ["employee", "status"]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Resignation.objects.select_related("employee", "approved_by").all()
        if user.company:
            return Resignation.objects.select_related("employee", "approved_by").filter(
                employee__company=user.company,
            )
        return Resignation.objects.none()


class TerminationViewSet(viewsets.ModelViewSet):
    permission_module = "employees"
    permission_classes = [permissions.IsAuthenticated, HasModulePermission, IsSameCompany]
    serializer_class = TerminationSerializer
    search_fields = ["employee__employee_id", "employee__first_name", "employee__last_name"]
    ordering_fields = ["termination_date", "created_at"]
    filterset_fields = ["employee", "termination_type"]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Termination.objects.select_related("employee", "approved_by").all()
        if user.company:
            return Termination.objects.select_related("employee", "approved_by").filter(
                employee__company=user.company,
            )
        return Termination.objects.none()
