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
  amountPaid: number;
  balanceDue: number;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
  items: InvoiceItem[];
  notes: string;
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
  method: string;
  type: string;
  reference: string;
  date: string;
  status: string;
  notes: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: string;
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

export interface Budget {
  id: string;
  name: string;
  period: string;
  amount: number;
  spent: number;
  status: string;
}

export interface FixedAsset {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  depreciationMethod: string;
  status: string;
}

function mapAccount(raw: any): Account {
  return {
    id: String(raw.id),
    code: raw.code || "",
    name: raw.name || "",
    type: raw.account_type || "asset",
    parentId: raw.parent ? String(raw.parent) : null,
    balance: Number(raw.balance) || 0,
    isActive: Boolean(raw.is_active),
    children: raw.children,
  };
}

function mapJournalEntry(raw: any): JournalEntry {
  return {
    id: String(raw.id),
    entryNumber: raw.entry_number || "",
    date: raw.date || "",
    reference: raw.reference || "",
    description: raw.description || "",
    status: raw.status || "draft",
    debitTotal: Number(raw.total_debit) || 0,
    creditTotal: Number(raw.total_credit) || 0,
    lines: (raw.lines || []).map(mapJournalLine),
  };
}

function mapJournalLine(raw: any): JournalLine {
  return {
    id: String(raw.id),
    accountId: String(raw.account),
    accountName: raw.account_name || "",
    debit: Number(raw.debit) || 0,
    credit: Number(raw.credit) || 0,
    description: raw.description || "",
  };
}

function mapInvoice(raw: any): Invoice {
  return {
    id: String(raw.id),
    invoiceNumber: raw.invoice_number || "",
    type: raw.invoice_type || "sales",
    customerId: String(raw.customer || raw.supplier || ""),
    customerName: raw.customer_name || raw.supplier_name || "",
    date: raw.date || "",
    dueDate: raw.due_date || "",
    subtotal: Number(raw.subtotal) || 0,
    tax: Number(raw.tax_amount) || 0,
    discount: Number(raw.discount_amount) || 0,
    total: Number(raw.total) || 0,
    amountPaid: Number(raw.amount_paid) || 0,
    balanceDue: Number(raw.balance_due) || 0,
    status: raw.status || "draft",
    items: (raw.items || []).map(mapInvoiceItem),
    notes: raw.notes || "",
  };
}

function mapInvoiceItem(raw: any): InvoiceItem {
  return {
    id: String(raw.id),
    description: raw.description || raw.product_name || "",
    quantity: Number(raw.quantity) || 0,
    unitPrice: Number(raw.unit_price) || 0,
    total: Number(raw.total) || 0,
  };
}

function mapPayment(raw: any): Payment {
  return {
    id: String(raw.id),
    paymentNumber: raw.payment_number || "",
    invoiceId: String(raw.invoice || ""),
    invoiceNumber: raw.invoice_number || "",
    amount: Number(raw.amount) || 0,
    method: raw.payment_method || "",
    type: raw.payment_type || "",
    reference: raw.reference || "",
    date: raw.date || "",
    status: raw.status || "pending",
    notes: raw.notes || "",
  };
}

function mapExpense(raw: any): Expense {
  return {
    id: String(raw.id),
    expenseNumber: raw.expense_number || raw.reference_number || "",
    date: raw.date || "",
    category: raw.category_name || raw.category || "",
    description: raw.description || "",
    amount: Number(raw.amount) || 0,
    status: raw.status || "pending",
    receiptUrl: raw.receipt || raw.receipt_url,
  };
}

function mapBankAccount(raw: any): BankAccount {
  return {
    id: String(raw.id),
    name: raw.name || "",
    accountNumber: raw.account_number || "",
    bankName: raw.bank_name || "",
    balance: Number(raw.balance) || 0,
    currency: raw.currency || "USD",
    isActive: Boolean(raw.is_active),
  };
}

function mapBudget(raw: any): Budget {
  return {
    id: String(raw.id),
    name: raw.name || "",
    period: raw.period || "",
    amount: Number(raw.amount) || 0,
    spent: Number(raw.spent) || 0,
    status: raw.status || "active",
  };
}

function mapFixedAsset(raw: any): FixedAsset {
  return {
    id: String(raw.id),
    name: raw.name || "",
    category: raw.category || "",
    purchaseDate: raw.purchase_date || "",
    purchasePrice: Number(raw.purchase_price) || 0,
    currentValue: Number(raw.current_value) || 0,
    depreciationMethod: raw.depreciation_method || "",
    status: raw.status || "active",
  };
}

function extractResults(data: any): any[] {
  return data?.results ?? data?.data ?? data ?? [];
}

export const accountingApi = {
  getAccounts: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/accounting/accounts/", { params });
    return { data: extractResults(data).map(mapAccount) };
  },

  createAccount: async (accountData: Omit<Account, "id" | "balance" | "children">) => {
    const { data } = await api.post<any>("/accounting/accounts/", {
      name: accountData.name,
      code: accountData.code,
      account_type: accountData.type,
      parent: accountData.parentId ? Number(accountData.parentId) : null,
      is_active: accountData.isActive,
    });
    return { data: mapAccount(data) };
  },

  updateAccount: async (id: string, accountData: Partial<Account>) => {
    const payload: any = {};
    if (accountData.name !== undefined) payload.name = accountData.name;
    if (accountData.code !== undefined) payload.code = accountData.code;
    if (accountData.type !== undefined) payload.account_type = accountData.type;
    if (accountData.isActive !== undefined) payload.is_active = accountData.isActive;
    const { data } = await api.put<any>(`/accounting/accounts/${id}/`, payload);
    return { data: mapAccount(data) };
  },

  deleteAccount: async (id: string) => {
    const { data } = await api.delete(`/accounting/accounts/${id}/`);
    return data;
  },

  getJournalEntries: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/accounting/journal-entries/", { params });
    return { data: extractResults(data).map(mapJournalEntry) };
  },

  createJournalEntry: async (entryData: { date: string; reference: string; description: string; lines: JournalLine[] }) => {
    const { data } = await api.post<any>("/accounting/journal-entries/", {
      date: entryData.date,
      reference: entryData.reference,
      description: entryData.description,
      lines: entryData.lines.map((l) => ({
        account: Number(l.accountId),
        debit: l.debit,
        credit: l.credit,
        description: l.description,
      })),
    });
    return { data: mapJournalEntry(data) };
  },

  postJournalEntry: async (id: string) => {
    const { data } = await api.post<any>(`/accounting/journal-entries/${id}/post/`);
    return { data: mapJournalEntry(data) };
  },

  cancelJournalEntry: async (id: string) => {
    const { data } = await api.post<any>(`/accounting/journal-entries/${id}/cancel/`);
    return { data: mapJournalEntry(data) };
  },

  getInvoices: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/accounting/invoices/", { params });
    return { data: extractResults(data).map(mapInvoice) };
  },

  getInvoice: async (id: string) => {
    const { data } = await api.get<any>(`/accounting/invoices/${id}/`);
    return { data: mapInvoice(data) };
  },

  createInvoice: async (invoiceData: any) => {
    const { data } = await api.post<any>("/accounting/invoices/", {
      invoice_type: invoiceData.type || "sales",
      customer: invoiceData.customerId ? Number(invoiceData.customerId) : null,
      date: invoiceData.date,
      due_date: invoiceData.dueDate,
      subtotal: invoiceData.subtotal,
      tax_amount: invoiceData.tax || 0,
      discount_amount: invoiceData.discount || 0,
      total: invoiceData.total,
      notes: invoiceData.notes,
      items: (invoiceData.items || []).map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    });
    return { data: mapInvoice(data) };
  },

  updateInvoice: async (id: string, invoiceData: Partial<Invoice>) => {
    const { data } = await api.put<any>(`/accounting/invoices/${id}/`, invoiceData);
    return { data: mapInvoice(data) };
  },

  sendInvoice: async (id: string) => {
    const { data } = await api.post<any>(`/accounting/invoices/${id}/send/`);
    return { data: mapInvoice(data) };
  },

  markInvoicePaid: async (id: string) => {
    const { data } = await api.post<any>(`/accounting/invoices/${id}/pay/`);
    return { data: mapInvoice(data) };
  },

  getPayments: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/accounting/payments/", { params });
    return { data: extractResults(data).map(mapPayment) };
  },

  createPayment: async (paymentData: any) => {
    const { data } = await api.post<any>("/accounting/payments/", {
      invoice: paymentData.invoiceId ? Number(paymentData.invoiceId) : null,
      amount: paymentData.amount,
      payment_method: paymentData.method,
      payment_type: paymentData.type,
      reference: paymentData.reference,
      date: paymentData.date,
      notes: paymentData.notes,
    });
    return { data: mapPayment(data) };
  },

  getExpenses: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/accounting/expenses/", { params });
    return { data: extractResults(data).map(mapExpense) };
  },

  createExpense: async (expenseData: any) => {
    const { data } = await api.post<any>("/accounting/expenses/", expenseData);
    return { data: mapExpense(data) };
  },

  approveExpense: async (id: string) => {
    const { data } = await api.post<any>(`/accounting/expenses/${id}/approve/`);
    return { data: mapExpense(data) };
  },

  getBankAccounts: async () => {
    const { data } = await api.get<any>("/accounting/bank-accounts/");
    return { data: extractResults(data).map(mapBankAccount) };
  },

  createBankAccount: async (bankData: Omit<BankAccount, "id" | "balance">) => {
    const { data } = await api.post<any>("/accounting/bank-accounts/", {
      name: bankData.name,
      account_number: bankData.accountNumber,
      bank_name: bankData.bankName,
      currency: bankData.currency,
      is_active: bankData.isActive,
    });
    return { data: mapBankAccount(data) };
  },

  getBudgets: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/accounting/budgets/", { params });
    return { data: extractResults(data).map(mapBudget) };
  },

  createBudget: async (budgetData: Omit<Budget, "id" | "spent">) => {
    const { data } = await api.post<any>("/accounting/budgets/", {
      name: budgetData.name,
      period: budgetData.period,
      amount: budgetData.amount,
      status: budgetData.status,
    });
    return { data: mapBudget(data) };
  },

  getFixedAssets: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/accounting/fixed-assets/", { params });
    return { data: extractResults(data).map(mapFixedAsset) };
  },

  createFixedAsset: async (assetData: Omit<FixedAsset, "id" | "currentValue">) => {
    const { data } = await api.post<any>("/accounting/fixed-assets/", {
      name: assetData.name,
      category: assetData.category,
      purchase_date: assetData.purchaseDate,
      purchase_price: assetData.purchasePrice,
      depreciation_method: assetData.depreciationMethod,
      status: assetData.status,
    });
    return { data: mapFixedAsset(data) };
  },
};
