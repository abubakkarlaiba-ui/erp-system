from django.contrib import admin

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


class JournalLineInline(admin.TabularInline):
    model = JournalLine
    extra = 1


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = [
        "code", "name", "account_type", "balance", "is_active", "is_system"
    ]
    list_filter = ["account_type", "is_active", "is_system"]
    search_fields = ["name", "code"]
    list_editable = ["is_active"]


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = [
        "entry_number", "date", "status", "total_debit", "total_credit",
        "created_by",
    ]
    list_filter = ["status", "date"]
    search_fields = ["entry_number", "description", "reference"]
    inlines = [JournalLineInline]
    readonly_fields = ["entry_number", "total_debit", "total_credit"]


@admin.register(JournalLine)
class JournalLineAdmin(admin.ModelAdmin):
    list_display = ["journal_entry", "account", "debit", "credit", "line_number"]
    list_filter = ["account"]
    search_fields = ["description"]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = [
        "invoice_number", "invoice_type", "customer", "supplier",
        "date", "due_date", "status", "total", "amount_paid",
    ]
    list_filter = ["invoice_type", "status", "date"]
    search_fields = ["invoice_number", "notes"]
    inlines = [InvoiceItemInline]
    readonly_fields = ["invoice_number"]


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = ["invoice", "product", "description", "quantity", "unit_price", "total"]
    list_filter = ["invoice__invoice_type"]
    search_fields = ["description"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        "payment_number", "payment_type", "invoice", "amount",
        "payment_method", "date", "status",
    ]
    list_filter = ["payment_type", "status", "payment_method"]
    search_fields = ["payment_number", "reference"]
    readonly_fields = ["payment_number"]


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = [
        "expense_number", "category", "amount", "date",
        "payment_method", "status", "created_by",
    ]
    list_filter = ["status", "payment_method", "category"]
    search_fields = ["expense_number", "category", "description"]
    readonly_fields = ["expense_number"]


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = [
        "name", "bank_name", "account_number", "account_type",
        "current_balance", "is_active",
    ]
    list_filter = ["account_type", "is_active"]
    search_fields = ["name", "bank_name", "account_number"]


@admin.register(BankTransaction)
class BankTransactionAdmin(admin.ModelAdmin):
    list_display = [
        "bank_account", "date", "description", "debit", "credit",
        "balance", "reconciliation_status",
    ]
    list_filter = ["reconciliation_status", "date"]
    search_fields = ["description", "reference"]


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = [
        "account", "fiscal_year", "period", "budget_amount",
        "actual_amount",
    ]
    list_filter = ["fiscal_year", "period"]
    search_fields = ["notes"]


@admin.register(FixedAsset)
class FixedAssetAdmin(admin.ModelAdmin):
    list_display = [
        "asset_code", "name", "category", "purchase_date",
        "purchase_value", "current_value", "status",
    ]
    list_filter = ["status", "category", "depreciation_method"]
    search_fields = ["name", "asset_code", "location"]
    readonly_fields = ["asset_code"]


@admin.register(TaxRate)
class TaxRateAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "rate", "tax_type", "is_active", "is_compound"]
    list_filter = ["tax_type", "is_active", "is_compound"]
    search_fields = ["name", "code"]
