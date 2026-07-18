from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.inventory.views.inventory_views import (
    BinViewSet,
    BrandViewSet,
    CategoryViewSet,
    ProductVariantViewSet,
    ProductViewSet,
    StockAdjustmentItemViewSet,
    StockAdjustmentViewSet,
    StockMovementViewSet,
    StockViewSet,
    WarehouseViewSet,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"brands", BrandViewSet, basename="brand")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"product-variants", ProductVariantViewSet, basename="product-variant")
router.register(r"warehouses", WarehouseViewSet, basename="warehouse")
router.register(r"bins", BinViewSet, basename="bin")
router.register(r"stocks", StockViewSet, basename="stock")
router.register(r"stock-movements", StockMovementViewSet, basename="stock-movement")
router.register(r"adjustments", StockAdjustmentViewSet, basename="stock-adjustment")
router.register(
    r"adjustment-items", StockAdjustmentItemViewSet, basename="stock-adjustment-item"
)

urlpatterns = [
    path("", include(router.urls)),
]
