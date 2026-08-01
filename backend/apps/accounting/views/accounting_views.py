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
    serializer_class = AccountSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "account_type", "is_active", "is_system", "parent"]
    search_fields = ["name", "code"]

    def get_queryset(self):
        user = self.request.user
        if user.company:
            return Account.objects.select_related("parent").prefetch_related("children").filter(company=user.company)
        return Account.objects.none()

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class JournalEntryViewSet(viewsets.ModelViewSet):
    serializer_class = JournalEntrySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "status", "fiscal_year", "date"]
    search_fields = ["entry_number", "description", "reference"]

    def get_queryset(self):
        user = self.request.user
        if user.company:
            return JournalEntry.objects.select_related(
                "fiscal_year", "created_by"
            ).prefetch_related("lines__account").filter(company=user.company)
        return JournalEntry.objects.none()

    def perform_create(self, serializer):
        from django.utils import timezone
        user = self.request.user
        company = user.company
        last = JournalEntry.objects.filter(company=company).count()
        entry_number = f"JE-{timezone.now().strftime('%Y%m')}-{str(last + 1).zfill(4)}"
        serializer.save(created_by=user, company=company, entry_number=entry_number)


class JournalLineViewSet(viewsets.ModelViewSet):
    serializer_class = JournalLineSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["journal_entry", "account"]

    def get_queryset(self):
        user = self.request.user
        if user.company:
            return JournalLine.objects.select_related("account", "journal_entry").filter(journal_entry__company=user.company)
        return JournalLine.objects.none()


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "invoice_type", "status", "date", "due_date"]
    search_fields = ["invoice_number", "notes"]

    def get_queryset(self):
        user = self.request.user
        if user.company:
            return Invoice.objects.select_related(
                "customer", "supplier", "created_by"
            ).prefetch_related("items__product").filter(company=user.company)
        return Invoice.objects.none()

    def perform_create(self, serializer):
        from django.utils import timezone
        user = self.request.user
        company = user.company
        prefix = "INV" if self.request.data.get("invoice_type") == "sales" else "PIN"
        last = Invoice.objects.filter(company=company, invoice_type=self.request.data.get("invoice_type", "sales")).count()
        invoice_number = f"{prefix}-{timezone.now().strftime('%Y%m')}-{str(last + 1).zfill(4)}"
        serializer.save(created_by=user, company=company, invoice_number=invoice_number)


class InvoiceItemViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["invoice", "product"]

    def get_queryset(self):
        user = self.request.user
        if user.company:
            return InvoiceItem.objects.select_related("invoice", "product").filter(invoice__company=user.company)
        return InvoiceItem.objects.none()


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "payment_type", "status", "payment_method", "date"]
    search_fields = ["payment_number", "reference", "notes"]

    def get_queryset(self):
        user = self.request.user
        if user.company:
            return Payment.objects.select_related("invoice", "bank_account", "created_by").filter(company=user.company)
        return Payment.objects.none()

    def perform_create(self, serializer):
        from django.utils import timezone
        user = self.request.user
        company = user.company
        last = Payment.objects.filter(company=company).count()
        payment_number = f"PAY-{timezone.now().strftime('%Y%m')}-{str(last + 1).zfill(4)}"
        serializer.save(created_by=user, company=company, payment_number=payment_number)


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "status", "payment_method", "category", "date"]
    search_fields = ["expense_number", "category", "description"]

    def get_queryset(self):
        user = self.request.user
        if user.company:
            return Expense.objects.select_related("account", "created_by", "approved_by").filter(company=user.company)
        return Expense.objects.none()

    def perform_create(self, serializer):
        from django.utils import timezone
        user = self.request.user
        company = user.company
        last = Expense.objects.filter(company=company).count()
        expense_number = f"EXP-{timezone.now().strftime('%Y%m')}-{str(last + 1).zfill(4)}"
        serializer.save(created_by=user, company=company, expense_number=expense_number)


class BankAccountViewSet(viewsets.ModelViewSet):
    serializer_class = BankAccountSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "account_type", "is_active"]
    search_fields = ["name", "bank_name", "account_number"]

    def get_queryset(self):
        user = self.request.user
        if user.company:
            return BankAccount.objects.filter(company=user.company)
        return BankAccount.objects.none()

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class BankTransactionViewSet(viewsets.ModelViewSet):
    serializer_class = BankTransactionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["bank_account", "reconciliation_status", "date"]
    search_fields = ["description", "reference"]

    def get_queryset(self):
        user = self.request.user
        if user.company:
            return BankTransaction.objects.select_related("bank_account").filter(bank_account__company=user.company)
        return BankTransaction.objects.none()

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["company", "account", "fiscal_year", "period"]

    def get_queryset(self):
        user = self.request.user
        if user.company:
            return Budget.objects.select_related("account", "fiscal_year").filter(company=user.company)
        return Budget.objects.none()

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class FixedAssetViewSet(viewsets.ModelViewSet):
    serializer_class = FixedAssetSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "status", "category", "depreciation_method"]
    search_fields = ["name", "asset_code", "location"]

    def get_queryset(self):
        user = self.request.user
        if user.company:
            return FixedAsset.objects.filter(company=user.company)
        return FixedAsset.objects.none()

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class TaxRateViewSet(viewsets.ModelViewSet):
    serializer_class = TaxRateSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["company", "tax_type", "is_active"]
    search_fields = ["name", "code"]

    def get_queryset(self):
        user = self.request.user
        if user.company:
            return TaxRate.objects.filter(company=user.company)
        return TaxRate.objects.none()

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)
