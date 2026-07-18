from rest_framework import serializers

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


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "company",
            "name",
            "customer_type",
            "email",
            "phone",
            "tax_id",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "country",
            "postal_code",
            "credit_limit",
            "balance",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LeadSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    assigned_to_name = serializers.CharField(
        source="assigned_to.get_full_name", read_only=True
    )

    class Meta:
        model = Lead
        fields = [
            "id",
            "company",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "company_name",
            "source",
            "status",
            "assigned_to",
            "assigned_to_name",
            "notes",
            "value",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class OpportunitySerializer(serializers.ModelSerializer):
    lead_name = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    assigned_to_name = serializers.CharField(
        source="assigned_to.get_full_name", read_only=True
    )

    class Meta:
        model = Opportunity
        fields = [
            "id",
            "company",
            "title",
            "lead",
            "lead_name",
            "customer",
            "customer_name",
            "value",
            "stage",
            "expected_close_date",
            "actual_close_date",
            "probability",
            "assigned_to",
            "assigned_to_name",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_lead_name(self, obj):
        if obj.lead:
            return obj.lead.full_name
        return None


class QuotationItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = QuotationItem
        fields = [
            "id",
            "quotation",
            "product",
            "product_name",
            "description",
            "quantity",
            "unit_price",
            "tax_rate",
            "discount",
            "total",
        ]
        read_only_fields = ["id"]


class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )

    class Meta:
        model = Quotation
        fields = [
            "id",
            "company",
            "quotation_number",
            "customer",
            "customer_name",
            "date",
            "valid_until",
            "status",
            "subtotal",
            "tax_amount",
            "discount_amount",
            "total",
            "notes",
            "terms",
            "created_by",
            "created_by_name",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "quotation_number",
            "created_at",
            "updated_at",
        ]


class QuotationCreateSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, required=False)

    class Meta:
        model = Quotation
        fields = [
            "id",
            "company",
            "customer",
            "date",
            "valid_until",
            "status",
            "subtotal",
            "tax_amount",
            "discount_amount",
            "total",
            "notes",
            "terms",
            "created_by",
            "items",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        quotation = Quotation.objects.create(**validated_data)
        for item_data in items_data:
            QuotationItem.objects.create(quotation=quotation, **item_data)
        return quotation

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                QuotationItem.objects.create(quotation=instance, **item_data)
        return instance


class SalesOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = SalesOrderItem
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
            "quantity_delivered",
        ]
        read_only_fields = ["id"]


class SalesOrderSerializer(serializers.ModelSerializer):
    items = SalesOrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )

    class Meta:
        model = SalesOrder
        fields = [
            "id",
            "company",
            "order_number",
            "customer",
            "customer_name",
            "quotation",
            "date",
            "required_date",
            "shipped_date",
            "status",
            "shipping_address",
            "subtotal",
            "tax_amount",
            "discount_amount",
            "total",
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
            "created_at",
            "updated_at",
        ]


class SalesOrderCreateSerializer(serializers.ModelSerializer):
    items = SalesOrderItemSerializer(many=True, required=False)

    class Meta:
        model = SalesOrder
        fields = [
            "id",
            "company",
            "customer",
            "quotation",
            "date",
            "required_date",
            "shipped_date",
            "status",
            "shipping_address",
            "subtotal",
            "tax_amount",
            "discount_amount",
            "total",
            "notes",
            "created_by",
            "items",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        order = SalesOrder.objects.create(**validated_data)
        for item_data in items_data:
            SalesOrderItem.objects.create(order=order, **item_data)
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                SalesOrderItem.objects.create(order=instance, **item_data)
        return instance


class SalesReturnSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    sales_order_number = serializers.CharField(
        source="sales_order.order_number", read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )

    class Meta:
        model = SalesReturn
        fields = [
            "id",
            "company",
            "return_number",
            "customer",
            "customer_name",
            "sales_order",
            "sales_order_number",
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
            "created_at",
            "updated_at",
        ]
