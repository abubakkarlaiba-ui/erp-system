from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.purchase.views.purchase_views import (
    SupplierViewSet,
    PurchaseRequestViewSet,
    PurchaseRequestItemViewSet,
    PurchaseOrderViewSet,
    PurchaseOrderItemViewSet,
    GoodsReceiptViewSet,
    GoodsReceiptItemViewSet,
    VendorBillViewSet,
    PurchaseReturnViewSet,
)

router = DefaultRouter()
router.register(r"suppliers", SupplierViewSet, basename="supplier")
router.register(r"purchase-requests", PurchaseRequestViewSet, basename="purchase-request")
router.register(r"purchase-orders", PurchaseOrderViewSet, basename="purchase-order")
router.register(r"goods-receipts", GoodsReceiptViewSet, basename="goods-receipt")
router.register(r"vendor-bills", VendorBillViewSet, basename="vendor-bill")
router.register(r"purchase-returns", PurchaseReturnViewSet, basename="purchase-return")

nested_router = DefaultRouter()
nested_router.register(r"items", PurchaseRequestItemViewSet, basename="purchase-request-item")

order_item_router = DefaultRouter()
order_item_router.register(r"items", PurchaseOrderItemViewSet, basename="purchase-order-item")

receipt_item_router = DefaultRouter()
receipt_item_router.register(r"items", GoodsReceiptItemViewSet, basename="goods-receipt-item")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "purchase-requests/<uuid:request_pk>/",
        include(nested_router.urls),
    ),
    path(
        "purchase-orders/<uuid:order_pk>/",
        include(order_item_router.urls),
    ),
    path(
        "goods-receipts/<uuid:receipt_pk>/",
        include(receipt_item_router.urls),
    ),
]
