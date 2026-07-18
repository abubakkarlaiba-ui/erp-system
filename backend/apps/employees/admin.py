from django.contrib import admin

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


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        "employee_id", "first_name", "last_name", "email",
        "department", "designation", "branch", "status", "joining_date",
    )
    list_filter = ("status", "gender", "department", "designation", "branch", "company")
    search_fields = ("employee_id", "first_name", "last_name", "email", "phone")
    readonly_fields = ("id", "created_at", "updated_at")
    raw_id_fields = ("user", "branch", "department", "designation", "manager")


@admin.register(EmployeeDocument)
class EmployeeDocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "employee", "document_type", "is_verified", "expiry_date")
    list_filter = ("document_type", "is_verified")
    search_fields = ("title", "employee__employee_id", "employee__first_name", "employee__last_name")
    readonly_fields = ("id", "created_at")
    raw_id_fields = ("employee",)


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ("employee", "contract_type", "start_date", "end_date", "salary", "status")
    list_filter = ("contract_type", "status")
    search_fields = ("employee__employee_id", "employee__first_name", "employee__last_name")
    readonly_fields = ("id", "created_at")
    raw_id_fields = ("employee",)


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ("employee", "institution_name", "degree", "field_of_study", "start_date", "end_date")
    search_fields = ("institution_name", "degree", "employee__employee_id")
    raw_id_fields = ("employee",)


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ("employee", "company_name", "designation", "start_date", "end_date")
    search_fields = ("company_name", "designation", "employee__employee_id")
    raw_id_fields = ("employee",)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("employee", "name", "proficiency", "years_of_experience")
    list_filter = ("proficiency")
    search_fields = ("name", "employee__employee_id")
    raw_id_fields = ("employee",)


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = (
        "employee", "old_designation", "new_designation",
        "promotion_date", "salary_before", "salary_after",
    )
    search_fields = ("employee__employee_id", "employee__first_name", "employee__last_name")
    readonly_fields = ("id", "created_at")
    raw_id_fields = ("employee",)


@admin.register(Transfer)
class TransferAdmin(admin.ModelAdmin):
    list_display = ("employee", "from_branch", "to_branch", "from_department", "to_department", "transfer_date")
    search_fields = ("employee__employee_id", "employee__first_name", "employee__last_name")
    readonly_fields = ("id", "created_at")
    raw_id_fields = ("employee", "from_branch", "to_branch", "from_department", "to_department")


@admin.register(Resignation)
class ResignationAdmin(admin.ModelAdmin):
    list_display = ("employee", "notice_date", "last_working_date", "status", "approved_by")
    list_filter = ("status")
    search_fields = ("employee__employee_id", "employee__first_name", "employee__last_name")
    readonly_fields = ("id", "created_at")
    raw_id_fields = ("employee", "approved_by")


@admin.register(Termination)
class TerminationAdmin(admin.ModelAdmin):
    list_display = ("employee", "termination_date", "termination_type", "approved_by")
    list_filter = ("termination_type")
    search_fields = ("employee__employee_id", "employee__first_name", "employee__last_name")
    readonly_fields = ("id", "created_at")
    raw_id_fields = ("employee", "approved_by")
