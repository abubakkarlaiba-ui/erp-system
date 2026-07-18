from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounting.views.accounting_views import (
    AccountViewSet,
    BankAccountViewSet,
    BankTransactionViewSet,
    BudgetViewSet,
    ExpenseViewSet,
    FixedAssetViewSet,
    InvoiceItemViewSet,
    InvoiceViewSet,
    JournalEntryViewSet,
    JournalLineViewSet,
    PaymentViewSet,
    TaxRateViewSet,
)

router = DefaultRouter()
router.register(r"accounts", AccountViewSet)
router.register(r"journal-entries", JournalEntryViewSet)
router.register(r"journal-lines", JournalLineViewSet)
router.register(r"invoices", InvoiceViewSet)
router.register(r"invoice-items", InvoiceItemViewSet)
router.register(r"payments", PaymentViewSet)
router.register(r"expenses", ExpenseViewSet)
router.register(r"bank-accounts", BankAccountViewSet)
router.register(r"bank-transactions", BankTransactionViewSet)
router.register(r"budgets", BudgetViewSet)
router.register(r"fixed-assets", FixedAssetViewSet)
router.register(r"tax-rates", TaxRateViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
