from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.sales.views.sales_views import (
    CustomerViewSet,
    LeadViewSet,
    OpportunityViewSet,
    QuotationViewSet,
    QuotationItemViewSet,
    SalesOrderViewSet,
    SalesOrderItemViewSet,
    SalesReturnViewSet,
)

router = DefaultRouter()
router.register(r"customers", CustomerViewSet, basename="customer")
router.register(r"leads", LeadViewSet, basename="lead")
router.register(r"opportunities", OpportunityViewSet, basename="opportunity")
router.register(r"quotations", QuotationViewSet, basename="quotation")
router.register(r"sales-orders", SalesOrderViewSet, basename="sales-order")
router.register(r"sales-returns", SalesReturnViewSet, basename="sales-return")

quotation_router = DefaultRouter()
quotation_router.register(r"items", QuotationItemViewSet, basename="quotation-item")

order_router = DefaultRouter()
order_router.register(r"items", SalesOrderItemViewSet, basename="sales-order-item")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "quotations/<uuid:quotation_pk>/",
        include(quotation_router.urls),
    ),
    path(
        "sales-orders/<uuid:order_pk>/",
        include(order_router.urls),
    ),
]
