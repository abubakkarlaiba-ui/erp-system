export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  avatar?: string
  role?: string
  company?: Company | null
  is_verified?: boolean
  two_factor_enabled?: boolean
  timezone?: string
  language?: string
  created_at?: string
  updated_at?: string
}

export interface Company {
  id: number
  name: string
  registration_number?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  website?: string
  tax_number?: string
  logo?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Branch {
  id: number
  name: string
  company: number
  company_name?: string
  code?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: number
  name: string
  company: number
  company_name?: string
  code?: string
  description?: string
  manager?: number
  manager_name?: string
  parent?: number
  parent_name?: string
  employee_count?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Designation {
  id: number
  title: string
  company: number
  company_name?: string
  description?: string
  min_salary?: number
  max_salary?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Employee {
  id: number
  employee_id?: string
  first_name: string
  last_name: string
  full_name?: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: string
  blood_group?: string
  marital_status?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  branch: number
  branch_name?: string
  department: number
  department_name?: string
  designation: number
  designation_name?: string
  joining_date: string
  employment_type: string
  reporting_to?: number
  reporting_to_name?: string
  salary?: number
  bank_name?: string
  bank_account_number?: string
  bank_ifsc?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  photo?: string
  user?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Contract {
  id: number
  employee: number
  employee_name?: string
  contract_type: string
  start_date: string
  end_date?: string
  salary: number
  designation?: number
  designation_name?: string
  department?: number
  department_name?: string
  terms?: string
  document?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Education {
  id: number
  employee: number
  employee_name?: string
  institution: string
  degree: string
  field_of_study?: string
  start_date: string
  end_date?: string
  grade?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: number
  employee: number
  employee_name?: string
  date: string
  check_in: string
  check_out?: string
  status: string
  overtime_hours?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface LeaveType {
  id: number
  name: string
  days_per_year: number
  is_paid: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LeaveRequest {
  id: number
  employee: number
  employee_name?: string
  leave_type: number
  leave_type_name?: string
  start_date: string
  end_date: string
  reason: string
  half_day: boolean
  status: string
  approved_by?: number
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface PayrollPeriod {
  id: number
  name: string
  start_date: string
  end_date: string
  status: string
  created_at: string
  updated_at: string
}

export interface Payslip {
  id: number
  employee: number
  employee_name?: string
  period: number
  period_name?: string
  basic_salary: number
  allowances: number
  deductions: number
  net_salary: number
  status: string
  paid_date?: string
  created_at: string
  updated_at: string
}

export interface SalaryStructure {
  id: number
  employee: number
  employee_name?: string
  basic_salary: number
  allowances: number
  deductions: number
  effective_from: string
  effective_to?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Account {
  id: number
  name: string
  code: string
  type: string
  parent?: number
  parent_name?: string
  description?: string
  balance: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: number
  date: string
  reference?: string
  description: string
  total_debit: number
  total_credit: number
  is_posted: boolean
  lines: JournalLine[]
  created_by?: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

export interface JournalLine {
  id: number
  journal_entry: number
  account: number
  account_name?: string
  account_code?: string
  debit: number
  credit: number
  description?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  sku: string
  barcode?: string
  category: number
  category_name?: string
  brand?: number
  brand_name?: string
  description?: string
  cost_price: number
  selling_price: number
  tax_rate: number
  unit: string
  min_stock_level: number
  max_stock_level: number
  weight?: number
  dimensions?: string
  has_variants: boolean
  stock_quantity?: number
  image?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: number
  product: number
  product_name?: string
  name: string
  sku: string
  barcode?: string
  cost_price: number
  selling_price: number
  stock_quantity: number
  attributes?: Record<string, string>
  image?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  code?: string
  description?: string
  parent?: number
  parent_name?: string
  product_count?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Brand {
  id: number
  name: string
  code?: string
  description?: string
  logo?: string
  website?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Warehouse {
  id: number
  name: string
  code?: string
  branch?: number
  branch_name?: string
  address?: string
  city?: string
  state?: string
  country?: string
  manager?: number
  manager_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Stock {
  id: number
  product: number
  product_name?: string
  product_sku?: string
  warehouse: number
  warehouse_name?: string
  quantity: number
  reserved_quantity: number
  available_quantity?: number
  created_at: string
  updated_at: string
}

export interface StockMovement {
  id: number
  product: number
  product_name?: string
  warehouse: number
  warehouse_name?: string
  movement_type: string
  quantity: number
  reference?: string
  notes?: string
  created_by?: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  tax_number?: string
  company?: string
  website?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Lead {
  id: number
  name: string
  email?: string
  phone?: string
  company?: string
  source?: string
  status: string
  assigned_to?: number
  assigned_to_name?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: number
  name: string
  lead?: number
  lead_name?: string
  customer?: number
  customer_name?: string
  value: number
  stage: string
  probability: number
  expected_close_date?: string
  assigned_to?: number
  assigned_to_name?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Quotation {
  id: number
  customer: number
  customer_name?: string
  branch?: number
  branch_name?: string
  reference?: string
  date: string
  valid_until: string
  subtotal: number
  discount_type: string
  discount_value: number
  tax_total: number
  total: number
  notes?: string
  terms?: string
  status: string
  items: QuotationItem[]
  created_by?: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

export interface QuotationItem {
  id: number
  quotation: number
  product: number
  product_name?: string
  description?: string
  quantity: number
  unit_price: number
  discount: number
  tax_rate: number
  subtotal: number
  tax_amount: number
  total: number
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: number
  customer: number
  customer_name?: string
  branch?: number
  branch_name?: string
  quotation?: number
  reference?: string
  date: string
  due_date: string
  subtotal: number
  discount_type: string
  discount_value: number
  tax_total: number
  total: number
  amount_paid: number
  balance_due?: number
  notes?: string
  terms?: string
  status: string
  items: InvoiceItem[]
  payments?: Payment[]
  created_by?: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: number
  invoice: number
  product: number
  product_name?: string
  description?: string
  quantity: number
  unit_price: number
  discount: number
  tax_rate: number
  subtotal: number
  tax_amount: number
  total: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: number
  invoice?: number
  invoice_number?: string
  customer?: number
  customer_name?: string
  supplier?: number
  supplier_name?: string
  amount: number
  payment_method: string
  payment_date: string
  reference?: string
  notes?: string
  account?: number
  account_name?: string
  created_by?: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

export interface SalesOrder {
  id: number
  customer: number
  customer_name?: string
  quotation?: number
  branch?: number
  branch_name?: string
  reference?: string
  date: string
  expected_delivery_date?: string
  subtotal: number
  discount_type: string
  discount_value: number
  tax_total: number
  total: number
  notes?: string
  shipping_address?: string
  status: string
  items: SalesOrderItem[]
  created_by?: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

export interface SalesOrderItem {
  id: number
  sales_order: number
  product: number
  product_name?: string
  description?: string
  quantity: number
  unit_price: number
  discount: number
  tax_rate: number
  subtotal: number
  tax_amount: number
  total: number
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: number
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  tax_number?: string
  company?: string
  website?: string
  payment_terms?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PurchaseOrder {
  id: number
  supplier: number
  supplier_name?: string
  branch?: number
  branch_name?: string
  reference?: string
  date: string
  expected_delivery_date?: string
  subtotal: number
  discount_type: string
  discount_value: number
  tax_total: number
  total: number
  notes?: string
  shipping_address?: string
  status: string
  items: PurchaseOrderItem[]
  created_by?: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

export interface PurchaseOrderItem {
  id: number
  purchase_order: number
  product: number
  product_name?: string
  description?: string
  quantity: number
  unit_price: number
  discount: number
  tax_rate: number
  subtotal: number
  tax_amount: number
  total: number
  received_quantity?: number
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export interface DashboardStats {
  total_employees: number
  active_employees: number
  total_customers: number
  total_products: number
  total_revenue: number
  total_expenses: number
  pending_invoices: number
  overdue_invoices: number
  pending_quotations: number
  pending_orders: number
  recent_activities: Activity[]
  revenue_chart: ChartDataPoint[]
  expense_chart: ChartDataPoint[]
  attendance_chart: ChartDataPoint[]
}

export interface Activity {
  id: number
  type: string
  title: string
  description: string
  timestamp: string
  user?: string
  icon?: string
}

export interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

export interface FilterParams {
  search?: string
  status?: string
  ordering?: string
  page?: number
  page_size?: number
  start_date?: string
  end_date?: string
  [key: string]: unknown
}

export interface PaginationParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  [key: string]: unknown
}

export interface EmployeeDocument {
  id: number
  employee: number
  employee_name?: string
  title: string
  document_type: string
  file?: string
  description?: string
  issue_date?: string
  expiry_date?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface EmployeeContract {
  id: number
  employee: number
  employee_name?: string
  contract_type: string
  start_date: string
  end_date?: string
  salary: number
  designation?: number
  designation_name?: string
  department?: number
  department_name?: string
  terms?: string
  document?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EmployeeEducation {
  id: number
  employee: number
  employee_name?: string
  institution: string
  degree: string
  field_of_study?: string
  start_date: string
  end_date?: string
  grade?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface EmployeeSkill {
  id: number
  employee: number
  employee_name?: string
  skill: string
  proficiency: string
  years_of_experience?: number
  created_at: string
  updated_at: string
}

export interface EmployeeTimeline {
  id: number
  employee: number
  event_type: string
  title: string
  description?: string
  date: string
  created_at: string
  updated_at: string
}

export interface FiscalYear {
  id: number
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  is_closed: boolean
  company?: number
  company_name?: string
  created_at: string
  updated_at: string
}

export interface Holiday {
  id: number
  name: string
  date: string
  description?: string
  is_recurring: boolean
  company?: number
  company_name?: string
  created_at: string
  updated_at: string
}

export interface SalesReturn {
  id: number
  sales_order: number
  sales_order_reference?: string
  customer: number
  customer_name?: string
  date: string
  reason: string
  total: number
  status: string
  items: SalesReturnItem[]
  notes?: string
  created_by?: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

export interface SalesReturnItem {
  id: number
  sales_return: number
  product: number
  product_name?: string
  quantity: number
  unit_price: number
  total: number
  reason?: string
  created_at: string
  updated_at: string
}

export interface PurchaseRequest {
  id: number
  reference?: string
  department?: number
  department_name?: string
  requested_by?: number
  requested_by_name?: string
  date: string
  status: string
  notes?: string
  items: PurchaseRequestItem[]
  created_at: string
  updated_at: string
}

export interface PurchaseRequestItem {
  id: number
  purchase_request: number
  product: number
  product_name?: string
  description?: string
  quantity: number
  estimated_price: number
  total: number
  created_at: string
  updated_at: string
}

export interface GoodsReceipt {
  id: number
  purchase_order: number
  purchase_order_reference?: string
  supplier: number
  supplier_name?: string
  reference?: string
  date: string
  received_by?: number
  received_by_name?: string
  status: string
  notes?: string
  items: GoodsReceiptItem[]
  created_at: string
  updated_at: string
}

export interface GoodsReceiptItem {
  id: number
  goods_receipt: number
  product: number
  product_name?: string
  quantity_received: number
  quantity_expected: number
  condition?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface VendorBill {
  id: number
  supplier: number
  supplier_name?: string
  purchase_order?: number
  reference?: string
  date: string
  due_date: string
  subtotal: number
  tax_total: number
  total: number
  amount_paid: number
  balance_due?: number
  status: string
  notes?: string
  created_by?: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

export interface PurchaseReturn {
  id: number
  purchase_order: number
  purchase_order_reference?: string
  supplier: number
  supplier_name?: string
  date: string
  reason: string
  total: number
  status: string
  items: PurchaseReturnItem[]
  notes?: string
  created_by?: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

export interface PurchaseReturnItem {
  id: number
  purchase_return: number
  product: number
  product_name?: string
  quantity: number
  unit_price: number
  total: number
  reason?: string
  created_at: string
  updated_at: string
}
