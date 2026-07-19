import { api } from "@/lib/api";

export interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  parentId: string | null;
  balance: number;
  isActive: boolean;
  children?: Account[];
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  reference: string;
  description: string;
  status: "draft" | "posted" | "cancelled";
  debitTotal: number;
  creditTotal: number;
  lines: JournalLine[];
}

export interface JournalLine {
  id?: string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: "sales" | "purchase";
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  method: "cash" | "bank_transfer" | "check" | "card";
  type: "incoming" | "outgoing";
  reference: string;
  date: string;
  status: "pending" | "completed" | "failed";
  notes: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  receiptUrl?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reconciled: boolean;
}

export interface Budget {
  id: string;
  name: string;
  period: string;
  amount: number;
  spent: number;
  status: "active" | "inactive";
}

export interface FixedAsset {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  depreciationMethod: string;
  status: "active" | "disposed" | "fully_depreciated";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const accountingApi = {
  getAccounts: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Account>>("/accounting/accounts/", { params }),

  createAccount: (data: Omit<Account, "id" | "balance" | "children">) =>
    api.post<Account>("/accounting/accounts/", data),

  updateAccount: (id: string, data: Partial<Account>) =>
    api.put<Account>(`/accounting/accounts/${id}/`, data),

  deleteAccount: (id: string) =>
    api.delete(`/accounting/accounts/${id}/`),

  getJournalEntries: (params?: PaginationParams) =>
    api.get<PaginatedResponse<JournalEntry>>("/accounting/journal-entries/", { params }),

  createJournalEntry: (data: { date: string; reference: string; description: string; lines: JournalLine[] }) =>
    api.post<JournalEntry>("/accounting/journal-entries/", data),

  postJournalEntry: (id: string) =>
    api.post<JournalEntry>(`/accounting/journal-entries/${id}/post/`),

  cancelJournalEntry: (id: string) =>
    api.post<JournalEntry>(`/accounting/journal-entries/${id}/cancel/`),

  getInvoices: (params?: PaginationParams & { type?: "sales" | "purchase" }) =>
    api.get<PaginatedResponse<Invoice>>("/accounting/invoices/", { params }),

  getInvoice: (id: string) =>
    api.get<Invoice>(`/accounting/invoices/${id}/`),

  createInvoice: (data: Omit<Invoice, "id" | "invoiceNumber" | "status">) =>
    api.post<Invoice>("/accounting/invoices/", data),

  updateInvoice: (id: string, data: Partial<Invoice>) =>
    api.put<Invoice>(`/accounting/invoices/${id}/`, data),

  sendInvoice: (id: string) =>
    api.post<Invoice>(`/accounting/invoices/${id}/send/`),

  markInvoicePaid: (id: string) =>
    api.post<Invoice>(`/accounting/invoices/${id}/pay/`),

  getPayments: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Payment>>("/accounting/payments/", { params }),

  createPayment: (data: Omit<Payment, "id" | "paymentNumber" | "status">) =>
    api.post<Payment>("/accounting/payments/", data),

  getPayment: (id: string) =>
    api.get<Payment>(`/accounting/payments/${id}/`),

  getExpenses: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Expense>>("/accounting/expenses/", { params }),

  createExpense: (data: Omit<Expense, "id" | "expenseNumber" | "status">) =>
    api.post<Expense>("/accounting/expenses/", data),

  approveExpense: (id: string) =>
    api.post<Expense>(`/accounting/expenses/${id}/approve/`),

  getBankAccounts: () =>
    api.get<BankAccount[]>("/accounting/bank-accounts/"),

  createBankAccount: (data: Omit<BankAccount, "id" | "balance">) =>
    api.post<BankAccount>("/accounting/bank-accounts/", data),

  getBankTransactions: (id: string, params?: PaginationParams) =>
    api.get<PaginatedResponse<BankTransaction>>(`/accounting/bank-accounts/${id}/transactions/`, { params }),

  reconcileBank: (id: string, data: { transactionIds: string[] }) =>
    api.post(`/accounting/bank-accounts/${id}/reconcile/`, data),

  getBudgets: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Budget>>("/accounting/budgets/", { params }),

  createBudget: (data: Omit<Budget, "id" | "spent">) =>
    api.post<Budget>("/accounting/budgets/", data),

  getFixedAssets: (params?: PaginationParams) =>
    api.get<PaginatedResponse<FixedAsset>>("/accounting/fixed-assets/", { params }),

  createFixedAsset: (data: Omit<FixedAsset, "id" | "currentValue">) =>
    api.post<FixedAsset>("/accounting/fixed-assets/", data),

  getTrialBalance: (params?: { startDate?: string; endDate?: string }) =>
    api.get<{ accounts: { accountId: string; accountName: string; debit: number; credit: number }[]; totalDebit: number; totalCredit: number }>("/accounting/reports/trial-balance/", { params }),

  getBalanceSheet: (params?: { asOfDate?: string }) =>
    api.get<{ assets: number; liabilities: number; equity: number }>("/accounting/reports/balance-sheet/", { params }),

  getIncomeStatement: (params?: { startDate?: string; endDate?: string }) =>
    api.get<{ revenue: number; expenses: number; netIncome: number }>("/accounting/reports/income-statement/", { params }),

  getCashFlow: (params?: { startDate?: string; endDate?: string }) =>
    api.get<{ operating: number; investing: number; financing: number; netChange: number }>("/accounting/reports/cash-flow/", { params }),
};
