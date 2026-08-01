from rest_framework import serializers

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


class AccountSerializer(serializers.ModelSerializer):
    children = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Account
        fields = [
            "id",
            "company",
            "name",
            "code",
            "account_type",
            "parent",
            "description",
            "balance",
            "is_active",
            "is_system",
            "children",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "balance", "created_at", "updated_at"]


class JournalLineSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = JournalLine
        fields = [
            "id",
            "journal_entry",
            "account",
            "account_name",
            "debit",
            "credit",
            "description",
            "line_number",
        ]
        read_only_fields = ["id"]


class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalLineSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )

    class Meta:
        model = JournalEntry
        fields = [
            "id",
            "company",
            "entry_number",
            "date",
            "reference",
            "description",
            "fiscal_year",
            "status",
            "total_debit",
            "total_credit",
            "created_by",
            "created_by_name",
            "lines",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "entry_number",
            "total_debit",
            "total_credit",
            "created_at",
            "updated_at",
        ]


class InvoiceItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = InvoiceItem
        fields = [
            "id",
            "invoice",
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


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(
        source="customer.name", read_only=True, default=None
    )
    supplier_name = serializers.CharField(
        source="supplier.name", read_only=True, default=None
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    balance_due = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True
    )

    class Meta:
        model = Invoice
        fields = [
            "id",
            "company",
            "invoice_number",
            "customer",
            "customer_name",
            "supplier",
            "supplier_name",
            "invoice_type",
            "date",
            "due_date",
            "status",
            "subtotal",
            "tax_amount",
            "discount_amount",
            "total",
            "amount_paid",
            "balance_due",
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
            "invoice_number",
            "balance_due",
            "created_at",
            "updated_at",
        ]


class PaymentSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(
        source="invoice.invoice_number", read_only=True, default=None
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "company",
            "payment_number",
            "invoice",
            "invoice_number",
            "payment_type",
            "amount",
            "payment_method",
            "reference",
            "bank_account",
            "date",
            "status",
            "notes",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "payment_number",
            "created_at",
            "updated_at",
        ]


class ExpenseSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    approved_by_name = serializers.CharField(
        source="approved_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = Expense
        fields = [
            "id",
            "company",
            "expense_number",
            "account",
            "amount",
            "date",
            "category",
            "description",
            "receipt",
            "payment_method",
            "approved_by",
            "approved_by_name",
            "status",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "expense_number",
            "created_at",
            "updated_at",
        ]


class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = [
            "id",
            "company",
            "name",
            "bank_name",
            "account_number",
            "account_type",
            "opening_balance",
            "current_balance",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "current_balance", "created_at", "updated_at"]


class BankTransactionSerializer(serializers.ModelSerializer):
    bank_account_name = serializers.CharField(
        source="bank_account.name", read_only=True
    )

    class Meta:
        model = BankTransaction
        fields = [
            "id",
            "bank_account",
            "bank_account_name",
            "date",
            "description",
            "reference",
            "debit",
            "credit",
            "balance",
            "reconciliation_status",
        ]
        read_only_fields = ["id"]


class BudgetSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)
    variance = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True
    )
    utilization_percentage = serializers.DecimalField(
        max_digits=7, decimal_places=2, read_only=True
    )

    class Meta:
        model = Budget
        fields = [
            "id",
            "company",
            "account",
            "account_name",
            "fiscal_year",
            "budget_amount",
            "actual_amount",
            "variance",
            "utilization_percentage",
            "period",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class FixedAssetSerializer(serializers.ModelSerializer):
    depreciation_rate = serializers.DecimalField(
        max_digits=7, decimal_places=2, read_only=True
    )

    class Meta:
        model = FixedAsset
        fields = [
            "id",
            "company",
            "name",
            "asset_code",
            "category",
            "purchase_date",
            "purchase_value",
            "depreciation_method",
            "useful_life_years",
            "accumulated_depreciation",
            "current_value",
            "depreciation_rate",
            "status",
            "location",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TaxRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRate
        fields = [
            "id",
            "company",
            "name",
            "code",
            "rate",
            "tax_type",
            "is_active",
            "is_compound",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
