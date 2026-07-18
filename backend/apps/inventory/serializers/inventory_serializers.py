from rest_framework import serializers

from apps.inventory.models.adjustment import StockAdjustment, StockAdjustmentItem
from apps.inventory.models.brand import Brand
from apps.inventory.models.category import Category
from apps.inventory.models.product import Product, ProductVariant
from apps.inventory.models.stock import Stock, StockMovement
from apps.inventory.models.warehouse import Bin, Warehouse


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "parent",
            "image",
            "is_active",
            "slug",
            "children",
            "product_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategorySerializer(children, many=True).data

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = [
            "id",
            "name",
            "description",
            "logo",
            "is_active",
            "slug",
            "product_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "product",
            "name",
            "sku",
            "barcode",
            "price",
            "cost_price",
            "attributes",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True)
    current_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "barcode",
            "description",
            "category",
            "category_name",
            "brand",
            "brand_name",
            "product_type",
            "cost_price",
            "selling_price",
            "tax_rate",
            "unit",
            "minimum_stock",
            "reorder_level",
            "weight",
            "dimensions",
            "image",
            "is_active",
            "slug",
            "variants",
            "current_stock",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]


class WarehouseSerializer(serializers.ModelSerializer):
    bin_count = serializers.SerializerMethodField()

    class Meta:
        model = Warehouse
        fields = [
            "id",
            "name",
            "code",
            "address",
            "city",
            "country",
            "manager",
            "phone",
            "is_active",
            "bin_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_bin_count(self, obj):
        return obj.bins.filter(is_active=True).count()


class BinSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)

    class Meta:
        model = Bin
        fields = [
            "id",
            "warehouse",
            "warehouse_name",
            "name",
            "code",
            "capacity",
            "current_occupancy",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    bin_name = serializers.CharField(source="bin.name", read_only=True)
    available_quantity = serializers.IntegerField(read_only=True)

    class Meta:
        model = Stock
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "variant",
            "warehouse",
            "warehouse_name",
            "bin",
            "bin_name",
            "quantity",
            "reserved_quantity",
            "available_quantity",
            "batch_number",
            "serial_number",
            "expiry_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    from_warehouse_name = serializers.CharField(
        source="from_warehouse.name", read_only=True
    )
    to_warehouse_name = serializers.CharField(
        source="to_warehouse.name", read_only=True
    )
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "variant",
            "from_warehouse",
            "from_warehouse_name",
            "to_warehouse",
            "to_warehouse_name",
            "quantity",
            "movement_type",
            "reference_number",
            "reference_model",
            "notes",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]


class StockAdjustmentItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = StockAdjustmentItem
        fields = [
            "id",
            "adjustment",
            "product",
            "product_name",
            "product_sku",
            "counted_quantity",
            "system_quantity",
            "difference",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "difference", "created_at", "updated_at"]


class StockAdjustmentSerializer(serializers.ModelSerializer):
    items = StockAdjustmentItemSerializer(many=True, read_only=True)
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)
    approved_by_name = serializers.CharField(
        source="approved_by.username", read_only=True
    )

    class Meta:
        model = StockAdjustment
        fields = [
            "id",
            "adjustment_number",
            "warehouse",
            "warehouse_name",
            "date",
            "reason",
            "status",
            "created_by",
            "created_by_name",
            "approved_by",
            "approved_by_name",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "adjustment_number",
            "created_by",
            "approved_by",
            "created_at",
            "updated_at",
        ]
