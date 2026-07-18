from rest_framework import serializers

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


class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)
    designation_name = serializers.CharField(source="designation.name", read_only=True, default=None)
    branch_name = serializers.CharField(source="branch.name", read_only=True, default=None)
    manager_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            "id", "employee_id", "first_name", "last_name", "email", "phone",
            "gender", "department", "department_name", "designation", "designation_name",
            "branch", "branch_name", "manager", "manager_name",
            "joining_date", "status", "profile_photo", "company", "created_at",
        ]
        read_only_fields = ["id", "company", "created_at"]

    def get_manager_name(self, obj):
        if obj.manager:
            return f"{obj.manager.first_name} {obj.manager.last_name}"
        return None


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            "id", "employee", "institution_name", "degree", "field_of_study",
            "start_date", "end_date", "grade", "description",
        ]
        read_only_fields = ["id"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            "id", "employee", "company_name", "designation",
            "start_date", "end_date", "description",
        ]
        read_only_fields = ["id"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "employee", "name", "proficiency", "years_of_experience"]
        read_only_fields = ["id"]


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    document_type_display = serializers.CharField(
        source="get_document_type_display", read_only=True,
    )

    class Meta:
        model = EmployeeDocument
        fields = [
            "id", "employee", "title", "description", "document_type",
            "document_type_display", "file", "expiry_date", "is_verified",
            "company", "created_at",
        ]
        read_only_fields = ["id", "company", "created_at"]


class ContractSerializer(serializers.ModelSerializer):
    contract_type_display = serializers.CharField(
        source="get_contract_type_display", read_only=True,
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Contract
        fields = [
            "id", "employee", "contract_type", "contract_type_display",
            "start_date", "end_date", "designation", "salary", "terms",
            "status", "status_display", "company", "created_at",
        ]
        read_only_fields = ["id", "company", "created_at"]


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = [
            "id", "employee", "old_designation", "new_designation",
            "promotion_date", "salary_before", "salary_after", "reason",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class TransferSerializer(serializers.ModelSerializer):
    from_branch_name = serializers.CharField(source="from_branch.name", read_only=True, default=None)
    to_branch_name = serializers.CharField(source="to_branch.name", read_only=True, default=None)
    from_department_name = serializers.CharField(
        source="from_department.name", read_only=True, default=None,
    )
    to_department_name = serializers.CharField(
        source="to_department.name", read_only=True, default=None,
    )

    class Meta:
        model = Transfer
        fields = [
            "id", "employee", "from_branch", "from_branch_name",
            "to_branch", "to_branch_name",
            "from_department", "from_department_name",
            "to_department", "to_department_name",
            "transfer_date", "reason", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ResignationSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    approved_by_email = serializers.EmailField(
        source="approved_by.email", read_only=True, default=None,
    )

    class Meta:
        model = Resignation
        fields = [
            "id", "employee", "notice_date", "last_working_date", "reason",
            "status", "status_display", "approved_by", "approved_by_email",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class TerminationSerializer(serializers.ModelSerializer):
    termination_type_display = serializers.CharField(
        source="get_termination_type_display", read_only=True,
    )
    approved_by_email = serializers.EmailField(
        source="approved_by.email", read_only=True, default=None,
    )

    class Meta:
        model = Termination
        fields = [
            "id", "employee", "termination_date", "reason",
            "termination_type", "termination_type_display",
            "approved_by", "approved_by_email", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)
    designation_name = serializers.CharField(source="designation.name", read_only=True, default=None)
    branch_name = serializers.CharField(source="branch.name", read_only=True, default=None)
    manager_name = serializers.SerializerMethodField()
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    documents = EmployeeDocumentSerializer(many=True, read_only=True)
    contracts = ContractSerializer(many=True, read_only=True)
    promotions = PromotionSerializer(many=True, read_only=True)
    transfers = TransferSerializer(many=True, read_only=True)
    resignations = ResignationSerializer(many=True, read_only=True)
    terminations = TerminationSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Employee
        fields = [
            "id", "user", "employee_id", "first_name", "last_name", "full_name",
            "email", "phone", "date_of_birth", "gender", "blood_group",
            "marital_status", "nationality",
            "address_line1", "address_line2", "city", "state", "country", "postal_code",
            "branch", "branch_name", "department", "department_name",
            "designation", "designation_name",
            "manager", "manager_name",
            "joining_date", "confirmation_date",
            "status", "status_display", "profile_photo",
            "emergency_contact_name", "emergency_contact_phone",
            "emergency_contact_relationship",
            "education", "experience", "skills", "documents",
            "contracts", "promotions", "transfers", "resignations", "terminations",
            "company", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "company", "created_at", "updated_at",
        ]

    def get_manager_name(self, obj):
        if obj.manager:
            return f"{obj.manager.first_name} {obj.manager.last_name}"
        return None
