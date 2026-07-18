from django.contrib import admin

from apps.sales.models import (
    Customer,
    Lead,
    Opportunity,
    Quotation,
    QuotationItem,
    SalesOrder,
    SalesOrderItem,
    SalesReturn,
)


class QuotationItemInline(admin.TabularInline):
    model = QuotationItem
    extra = 0
    raw_id_fields = ["product"]


class SalesOrderItemInline(admin.TabularInline):
    model = SalesOrderItem
    extra = 0
    raw_id_fields = ["product"]


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "customer_type",
        "email",
        "phone",
        "city",
        "country",
        "credit_limit",
        "balance",
        "is_active",
        "created_at",
    ]
    list_filter = ["is_active", "customer_type", "country"]
    search_fields = ["name", "email", "phone", "tax_id"]
    readonly_fields = ["id", "created_at", "updated_at"]
    raw_id_fields = ["company"]
    fieldsets = (
        (None, {"fields": ("id", "company", "name", "customer_type", "is_active")}),
        ("Contact", {"fields": ("email", "phone", "tax_id")}),
        ("Address", {"fields": ("address_line1", "address_line2", "city", "state", "country", "postal_code")}),
        ("Financial", {"fields": ("credit_limit", "balance")}),
        ("Other", {"fields": ("notes",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "company_name",
        "source",
        "status",
        "value",
        "assigned_to",
        "created_at",
    ]
    list_filter = ["source", "status"]
    search_fields = ["first_name", "last_name", "email", "company_name"]
    readonly_fields = ["id", "created_at", "updated_at"]
    raw_id_fields = ["company", "assigned_to"]


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "customer",
        "lead",
        "value",
        "stage",
        "probability",
        "expected_close_date",
        "actual_close_date",
        "assigned_to",
        "created_at",
    ]
    list_filter = ["stage"]
    search_fields = ["title"]
    readonly_fields = ["id", "created_at", "updated_at"]
    raw_id_fields = ["company", "lead", "customer", "assigned_to"]


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = [
        "quotation_number",
        "customer",
        "date",
        "valid_until",
        "status",
        "subtotal",
        "tax_amount",
        "discount_amount",
        "total",
        "created_by",
    ]
    list_filter = ["status", "date"]
    search_fields = ["quotation_number", "customer__name"]
    readonly_fields = ["id", "quotation_number", "created_at", "updated_at"]
    raw_id_fields = ["company", "customer", "created_by"]
    inlines = [QuotationItemInline]


@admin.register(QuotationItem)
class QuotationItemAdmin(admin.ModelAdmin):
    list_display = [
        "quotation",
        "product",
        "description",
        "quantity",
        "unit_price",
        "tax_rate",
        "discount",
        "total",
    ]
    search_fields = ["description"]
    raw_id_fields = ["quotation", "product"]


@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = [
        "order_number",
        "customer",
        "quotation",
        "date",
        "required_date",
        "shipped_date",
        "status",
        "subtotal",
        "total",
        "created_by",
    ]
    list_filter = ["status", "date"]
    search_fields = ["order_number", "customer__name"]
    readonly_fields = ["id", "order_number", "created_at", "updated_at"]
    raw_id_fields = ["company", "customer", "quotation", "created_by"]
    inlines = [SalesOrderItemInline]


@admin.register(SalesOrderItem)
class SalesOrderItemAdmin(admin.ModelAdmin):
    list_display = [
        "order",
        "product",
        "description",
        "quantity",
        "unit_price",
        "tax_rate",
        "discount",
        "total",
        "quantity_delivered",
    ]
    search_fields = ["description"]
    raw_id_fields = ["order", "product"]


@admin.register(SalesReturn)
class SalesReturnAdmin(admin.ModelAdmin):
    list_display = [
        "return_number",
        "customer",
        "sales_order",
        "date",
        "reason",
        "status",
        "total",
        "created_by",
    ]
    list_filter = ["status", "date"]
    search_fields = ["return_number", "customer__name"]
    readonly_fields = ["id", "return_number", "created_at", "updated_at"]
    raw_id_fields = ["company", "customer", "sales_order", "created_by"]
