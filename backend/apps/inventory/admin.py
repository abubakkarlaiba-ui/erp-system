from django.contrib import admin

from apps.inventory.models.adjustment import StockAdjustment, StockAdjustmentItem
from apps.inventory.models.brand import Brand
from apps.inventory.models.category import Category
from apps.inventory.models.product import Product, ProductVariant
from apps.inventory.models.stock import Stock, StockMovement
from apps.inventory.models.warehouse import Bin, Warehouse


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "company", "parent", "is_active", "slug"]
    list_filter = ["is_active", "company"]
    search_fields = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ["name", "company", "is_active", "slug"]
    list_filter = ["is_active", "company"]
    search_fields = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "sku",
        "company",
        "category",
        "brand",
        "product_type",
        "selling_price",
        "is_active",
    ]
    list_filter = ["is_active", "product_type", "company", "category", "brand"]
    search_fields = ["name", "sku", "barcode"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductVariantInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ["name", "product", "sku", "price", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name", "sku"]


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "company", "city", "country", "is_active"]
    list_filter = ["is_active", "company"]
    search_fields = ["name", "code"]


@admin.register(Bin)
class BinAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "code",
        "warehouse",
        "capacity",
        "current_occupancy",
        "is_active",
    ]
    list_filter = ["is_active", "warehouse"]
    search_fields = ["name", "code"]


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = [
        "product",
        "warehouse",
        "quantity",
        "reserved_quantity",
        "batch_number",
        "expiry_date",
    ]
    list_filter = ["warehouse", "product__company"]
    search_fields = ["product__name", "batch_number", "serial_number"]


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = [
        "product",
        "movement_type",
        "quantity",
        "from_warehouse",
        "to_warehouse",
        "created_by",
        "created_at",
    ]
    list_filter = ["movement_type", "company"]
    search_fields = ["product__name", "reference_number"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = [
        "adjustment_number",
        "warehouse",
        "date",
        "status",
        "created_by",
        "approved_by",
    ]
    list_filter = ["status", "company"]
    search_fields = ["adjustment_number"]
    readonly_fields = ["adjustment_number", "created_at", "updated_at"]


@admin.register(StockAdjustmentItem)
class StockAdjustmentItemAdmin(admin.ModelAdmin):
    list_display = [
        "adjustment",
        "product",
        "counted_quantity",
        "system_quantity",
        "difference",
    ]
    search_fields = ["product__name", "adjustment__adjustment_number"]
