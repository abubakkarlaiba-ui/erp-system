from django.contrib import admin
from apps.purchase.models import (
    Supplier,
    PurchaseRequest,
    PurchaseRequestItem,
    PurchaseOrder,
    PurchaseOrderItem,
    GoodsReceipt,
    GoodsReceiptItem,
    VendorBill,
    PurchaseReturn,
)


class PurchaseRequestItemInline(admin.TabularInline):
    model = PurchaseRequestItem
    extra = 0
    readonly_fields = ["total_estimated_price"]


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "contact_person",
        "email",
        "phone",
        "city",
        "country",
        "payment_terms",
        "balance",
        "is_active",
        "created_at",
    ]
    list_filter = ["is_active", "country"]
    search_fields = ["name", "contact_person", "email", "tax_id"]
    readonly_fields = ["id", "balance", "created_at", "updated_at"]
    raw_id_fields = ["company"]


@admin.register(PurchaseRequest)
class PurchaseRequestAdmin(admin.ModelAdmin):
    list_display = [
        "request_number",
        "requested_by",
        "department",
        "date",
        "status",
        "created_at",
    ]
    list_filter = ["status", "date"]
    search_fields = ["request_number"]
    readonly_fields = ["id", "created_at", "updated_at"]
    raw_id_fields = ["company", "requested_by", "department"]
    inlines = [PurchaseRequestItemInline]


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 0
    readonly_fields = ["total", "quantity_received"]


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = [
        "order_number",
        "supplier",
        "date",
        "expected_delivery_date",
        "status",
        "subtotal",
        "tax_amount",
        "discount_amount",
        "total",
        "created_at",
    ]
    list_filter = ["status", "date"]
    search_fields = ["order_number"]
    readonly_fields = [
        "id",
        "subtotal",
        "tax_amount",
        "total",
        "created_at",
        "updated_at",
    ]
    raw_id_fields = ["company", "supplier", "purchase_request", "created_by"]
    inlines = [PurchaseOrderItemInline]


class GoodsReceiptItemInline(admin.TabularInline):
    model = GoodsReceiptItem
    extra = 0


@admin.register(GoodsReceipt)
class GoodsReceiptAdmin(admin.ModelAdmin):
    list_display = [
        "receipt_number",
        "purchase_order",
        "warehouse",
        "received_by",
        "date",
        "status",
        "created_at",
    ]
    list_filter = ["status", "date"]
    search_fields = ["receipt_number"]
    readonly_fields = ["id", "created_at", "updated_at"]
    raw_id_fields = ["purchase_order", "warehouse", "received_by"]
    inlines = [GoodsReceiptItemInline]


@admin.register(VendorBill)
class VendorBillAdmin(admin.ModelAdmin):
    list_display = [
        "bill_number",
        "supplier",
        "date",
        "due_date",
        "amount",
        "tax_amount",
        "total_amount",
        "status",
        "created_at",
    ]
    list_filter = ["status", "date"]
    search_fields = ["bill_number"]
    readonly_fields = [
        "id",
        "total_amount",
        "created_at",
        "updated_at",
    ]
    raw_id_fields = ["company", "supplier", "purchase_order", "created_by"]


@admin.register(PurchaseReturn)
class PurchaseReturnAdmin(admin.ModelAdmin):
    list_display = [
        "return_number",
        "supplier",
        "purchase_order",
        "date",
        "status",
        "total",
        "created_at",
    ]
    list_filter = ["status", "date"]
    search_fields = ["return_number"]
    readonly_fields = ["id", "total", "created_at", "updated_at"]
    raw_id_fields = ["company", "supplier", "purchase_order", "created_by"]
