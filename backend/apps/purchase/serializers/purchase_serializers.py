from rest_framework import serializers
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


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            "id",
            "company",
            "name",
            "contact_person",
            "email",
            "phone",
            "tax_id",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "country",
            "postal_code",
            "payment_terms",
            "balance",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "balance", "created_at", "updated_at"]


class PurchaseRequestItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name", read_only=True
    )

    class Meta:
        model = PurchaseRequestItem
        fields = [
            "id",
            "request",
            "product",
            "product_name",
            "description",
            "quantity",
            "estimated_unit_price",
            "total_estimated_price",
        ]
        read_only_fields = ["id", "total_estimated_price"]


class PurchaseRequestSerializer(serializers.ModelSerializer):
    items = PurchaseRequestItemSerializer(many=True, read_only=True)
    requested_by_name = serializers.CharField(
        source="requested_by.get_full_name", read_only=True
    )
    department_name = serializers.CharField(
        source="department.name", read_only=True
    )

    class Meta:
        model = PurchaseRequest
        fields = [
            "id",
            "company",
            "request_number",
            "requested_by",
            "requested_by_name",
            "department",
            "department_name",
            "date",
            "status",
            "notes",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "request_number", "created_at", "updated_at"]


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name", read_only=True
    )

    class Meta:
        model = PurchaseOrderItem
        fields = [
            "id",
            "order",
            "product",
            "product_name",
            "description",
            "quantity",
            "unit_price",
            "tax_rate",
            "discount",
            "total",
            "quantity_received",
        ]
        read_only_fields = ["id", "total", "quantity_received"]


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(
        source="supplier.name", read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )

    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "company",
            "order_number",
            "supplier",
            "supplier_name",
            "purchase_request",
            "date",
            "expected_delivery_date",
            "status",
            "subtotal",
            "tax_amount",
            "discount_amount",
            "total",
            "shipping_address",
            "notes",
            "created_by",
            "created_by_name",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "order_number",
            "subtotal",
            "tax_amount",
            "total",
            "created_at",
            "updated_at",
        ]


class GoodsReceiptItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name", read_only=True
    )

    class Meta:
        model = GoodsReceiptItem
        fields = [
            "id",
            "receipt",
            "product",
            "product_name",
            "purchase_order_item",
            "quantity_received",
            "quantity_accepted",
            "quantity_rejected",
            "batch_number",
            "expiry_date",
            "notes",
        ]
        read_only_fields = ["id"]


class GoodsReceiptSerializer(serializers.ModelSerializer):
    items = GoodsReceiptItemSerializer(many=True, read_only=True)
    received_by_name = serializers.CharField(
        source="received_by.get_full_name", read_only=True
    )
    warehouse_name = serializers.CharField(
        source="warehouse.name", read_only=True
    )
    order_number = serializers.CharField(
        source="purchase_order.order_number", read_only=True
    )

    class Meta:
        model = GoodsReceipt
        fields = [
            "id",
            "receipt_number",
            "purchase_order",
            "order_number",
            "warehouse",
            "warehouse_name",
            "received_by",
            "received_by_name",
            "date",
            "status",
            "notes",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "receipt_number", "created_at", "updated_at"]


class VendorBillSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(
        source="supplier.name", read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )

    class Meta:
        model = VendorBill
        fields = [
            "id",
            "company",
            "bill_number",
            "supplier",
            "supplier_name",
            "purchase_order",
            "date",
            "due_date",
            "amount",
            "tax_amount",
            "total_amount",
            "status",
            "notes",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "bill_number",
            "total_amount",
            "created_at",
            "updated_at",
        ]


class PurchaseReturnSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(
        source="supplier.name", read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    order_number = serializers.CharField(
        source="purchase_order.order_number", read_only=True
    )

    class Meta:
        model = PurchaseReturn
        fields = [
            "id",
            "company",
            "return_number",
            "supplier",
            "supplier_name",
            "purchase_order",
            "order_number",
            "date",
            "reason",
            "status",
            "total",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "return_number",
            "total",
            "created_at",
            "updated_at",
        ]
