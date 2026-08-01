from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounting.models import (
    Account,
    BankAccount,
    BankTransaction,
    Budget,
    Expense,
    FixedAsset,
    Invoice,
    InvoiceItem,
    JournalEntry,
    JournalLine,
    Payment,
    TaxRate,
)
from apps.accounting.serializers.accounting_serializers import (
    AccountSerializer,
    BankAccountSerializer,
    BankTransactionSerializer,
    BudgetSerializer,
    ExpenseSerializer,
    FixedAssetSerializer,
    InvoiceItemSerializer,
    InvoiceSerializer,
    JournalEntrySerializer,
    JournalLineSerializer,
    PaymentSerializer,
    TaxRateSerializer,
)


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.select_related("parent").prefetch_related("children")
    serializer_class = AccountSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "account_type", "is_active", "is_system", "parent"]
    search_fields = ["name", "code"]


class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.select_related(
        "fiscal_year", "created_by"
    ).prefetch_related("lines__account")
    serializer_class = JournalEntrySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "status", "fiscal_year", "date"]
    search_fields = ["entry_number", "description", "reference"]

    def perform_create(self, serializer):
        from django.utils import timezone
        user = self.request.user
        company = user.company
        last = JournalEntry.objects.filter(company=company).count()
        entry_number = f"JE-{timezone.now().strftime('%Y%m')}-{str(last + 1).zfill(4)}"
        serializer.save(created_by=user, company=company, entry_number=entry_number)


class JournalLineViewSet(viewsets.ModelViewSet):
    queryset = JournalLine.objects.select_related("account", "journal_entry")
    serializer_class = JournalLineSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["journal_entry", "account"]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related(
        "customer", "supplier", "created_by"
    ).prefetch_related("items__product")
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "invoice_type", "status", "date", "due_date"]
    search_fields = ["invoice_number", "notes"]

    def perform_create(self, serializer):
        from django.utils import timezone
        user = self.request.user
        company = user.company
        prefix = "INV" if self.request.data.get("invoice_type") == "sales" else "PIN"
        last = Invoice.objects.filter(company=company, invoice_type=self.request.data.get("invoice_type", "sales")).count()
        invoice_number = f"{prefix}-{timezone.now().strftime('%Y%m')}-{str(last + 1).zfill(4)}"
        serializer.save(created_by=user, company=company, invoice_number=invoice_number)


class InvoiceItemViewSet(viewsets.ModelViewSet):
    queryset = InvoiceItem.objects.select_related("invoice", "product")
    serializer_class = InvoiceItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["invoice", "product"]


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("invoice", "bank_account", "created_by")
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "payment_type", "status", "payment_method", "date"]
    search_fields = ["payment_number", "reference", "notes"]

    def perform_create(self, serializer):
        from django.utils import timezone
        user = self.request.user
        company = user.company
        last = Payment.objects.filter(company=company).count()
        payment_number = f"PAY-{timezone.now().strftime('%Y%m')}-{str(last + 1).zfill(4)}"
        serializer.save(created_by=user, company=company, payment_number=payment_number)


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related("account", "created_by", "approved_by")
    serializer_class = ExpenseSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "status", "payment_method", "category", "date"]
    search_fields = ["expense_number", "category", "description"]

    def perform_create(self, serializer):
        from django.utils import timezone
        user = self.request.user
        company = user.company
        last = Expense.objects.filter(company=company).count()
        expense_number = f"EXP-{timezone.now().strftime('%Y%m')}-{str(last + 1).zfill(4)}"
        serializer.save(created_by=user, company=company, expense_number=expense_number)


class BankAccountViewSet(viewsets.ModelViewSet):
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "account_type", "is_active"]
    search_fields = ["name", "bank_name", "account_number"]


class BankTransactionViewSet(viewsets.ModelViewSet):
    queryset = BankTransaction.objects.select_related("bank_account")
    serializer_class = BankTransactionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["bank_account", "reconciliation_status", "date"]
    search_fields = ["description", "reference"]


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.select_related("account", "fiscal_year")
    serializer_class = BudgetSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["company", "account", "fiscal_year", "period"]


class FixedAssetViewSet(viewsets.ModelViewSet):
    queryset = FixedAsset.objects.all()
    serializer_class = FixedAssetSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "status", "category", "depreciation_method"]
    search_fields = ["name", "asset_code", "location"]


class TaxRateViewSet(viewsets.ModelViewSet):
    queryset = TaxRate.objects.all()
    serializer_class = TaxRateSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "tax_type", "is_active"]
    search_fields = ["name", "code"]
