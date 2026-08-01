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
router.register(r"accounts", AccountViewSet, basename="account")
router.register(r"journal-entries", JournalEntryViewSet, basename="journal-entry")
router.register(r"journal-lines", JournalLineViewSet, basename="journal-line")
router.register(r"invoices", InvoiceViewSet, basename="invoice")
router.register(r"invoice-items", InvoiceItemViewSet, basename="invoice-item")
router.register(r"payments", PaymentViewSet, basename="payment")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"bank-accounts", BankAccountViewSet, basename="bank-account")
router.register(r"bank-transactions", BankTransactionViewSet, basename="bank-transaction")
router.register(r"budgets", BudgetViewSet, basename="budget")
router.register(r"fixed-assets", FixedAssetViewSet, basename="fixed-asset")
router.register(r"tax-rates", TaxRateViewSet, basename="tax-rate")

urlpatterns = [
    path("", include(router.urls)),
]
