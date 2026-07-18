import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords don't match",
    path: ["password_confirm"],
  })

export type RegisterInput = z.infer<typeof registerSchema>

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  registration_number: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  tax_number: z.string().optional(),
  logo: z.any().optional(),
})

export type CompanyInput = z.infer<typeof companySchema>

export const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  company: z.number().min(1, "Company is required"),
  code: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type BranchInput = z.infer<typeof branchSchema>

export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  company: z.number().min(1, "Company is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  manager: z.number().optional(),
  parent: z.number().optional(),
  is_active: z.boolean().default(true),
})

export type DepartmentInput = z.infer<typeof departmentSchema>

export const designationSchema = z.object({
  title: z.string().min(1, "Designation title is required"),
  company: z.number().min(1, "Company is required"),
  description: z.string().optional(),
  min_salary: z.number().min(0).optional(),
  max_salary: z.number().min(0).optional(),
  is_active: z.boolean().default(true),
})

export type DesignationInput = z.infer<typeof designationSchema>

export const employeeSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["M", "F", "O", ""]).optional(),
  blood_group: z.string().optional(),
  marital_status: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  branch: z.number().min(1, "Branch is required"),
  department: z.number().min(1, "Department is required"),
  designation: z.number().min(1, "Designation is required"),
  joining_date: z.string().min(1, "Joining date is required"),
  employee_id: z.string().optional(),
  employment_type: z.enum(["FT", "PT", "CT", "IN"]).default("FT"),
  reporting_to: z.number().optional(),
  salary: z.number().min(0).optional(),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_ifsc: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  photo: z.any().optional(),
})

export type EmployeeInput = z.infer<typeof employeeSchema>

export const educationSchema = z.object({
  employee: z.number().min(1, "Employee is required"),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field_of_study: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
})

export type EducationInput = z.infer<typeof educationSchema>

export const contractSchema = z.object({
  employee: z.number().min(1, "Employee is required"),
  contract_type: z.enum(["FT", "PT", "CT", "IN"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  salary: z.number().min(0, "Salary must be positive"),
  designation: z.number().optional(),
  department: z.number().optional(),
  terms: z.string().optional(),
  document: z.any().optional(),
})

export type ContractInput = z.infer<typeof contractSchema>

export const leaveTypeSchema = z.object({
  name: z.string().min(1, "Leave type name is required"),
  days_per_year: z.number().min(1, "Days per year is required"),
  is_paid: z.boolean().default(true),
  is_active: z.boolean().default(true),
})

export type LeaveTypeInput = z.infer<typeof leaveTypeSchema>

export const leaveRequestSchema = z.object({
  employee: z.number().min(1, "Employee is required"),
  leave_type: z.number().min(1, "Leave type is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  reason: z.string().min(1, "Reason is required"),
  half_day: z.boolean().default(false),
})

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>

export const attendanceSchema = z.object({
  employee: z.number().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  check_in: z.string().min(1, "Check-in time is required"),
  check_out: z.string().optional(),
  status: z.enum(["P", "A", "L", "H", "WO"]).default("P"),
  overtime_hours: z.number().min(0).optional(),
  notes: z.string().optional(),
})

export type AttendanceInput = z.infer<typeof attendanceSchema>

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  parent: z.number().optional(),
  is_active: z.boolean().default(true),
})

export type CategoryInput = z.infer<typeof categorySchema>

export const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  logo: z.any().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  is_active: z.boolean().default(true),
})

export type BrandInput = z.infer<typeof brandSchema>

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  category: z.number().min(1, "Category is required"),
  brand: z.number().optional(),
  description: z.string().optional(),
  cost_price: z.number().min(0, "Cost price must be positive"),
  selling_price: z.number().min(0, "Selling price must be positive"),
  tax_rate: z.number().min(0).max(100).default(0),
  unit: z.string().default("pcs"),
  min_stock_level: z.number().min(0).default(0),
  max_stock_level: z.number().min(0).default(0),
  weight: z.number().min(0).optional(),
  dimensions: z.string().optional(),
  is_active: z.boolean().default(true),
  has_variants: z.boolean().default(false),
  image: z.any().optional(),
})

export type ProductInput = z.infer<typeof productSchema>

export const productVariantSchema = z.object({
  product: z.number().min(1, "Product is required"),
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  cost_price: z.number().min(0),
  selling_price: z.number().min(0),
  stock_quantity: z.number().min(0).default(0),
  attributes: z.record(z.string(), z.string()).optional(),
  is_active: z.boolean().default(true),
  image: z.any().optional(),
})

export type ProductVariantInput = z.infer<typeof productVariantSchema>

export const warehouseSchema = z.object({
  name: z.string().min(1, "Warehouse name is required"),
  code: z.string().optional(),
  branch: z.number().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  manager: z.number().optional(),
  is_active: z.boolean().default(true),
})

export type WarehouseInput = z.infer<typeof warehouseSchema>

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  tax_number: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type CustomerInput = z.infer<typeof customerSchema>

export const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  tax_number: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type SupplierInput = z.infer<typeof supplierSchema>

const quotationItemSchema = z.object({
  product: z.number().min(1, "Product is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price must be positive"),
  discount: z.number().min(0).max(100).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
})

export type QuotationItemInput = z.infer<typeof quotationItemSchema>

export const quotationSchema = z.object({
  customer: z.number().min(1, "Customer is required"),
  branch: z.number().optional(),
  reference: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  valid_until: z.string().min(1, "Valid until date is required"),
  notes: z.string().optional(),
  terms: z.string().optional(),
  discount_type: z.enum(["fixed", "percentage"]).default("percentage"),
  discount_value: z.number().min(0).default(0),
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
})

export type QuotationInput = z.infer<typeof quotationSchema>

const invoiceItemSchema = z.object({
  product: z.number().min(1, "Product is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price must be positive"),
  discount: z.number().min(0).max(100).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
})

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>

export const invoiceSchema = z.object({
  customer: z.number().min(1, "Customer is required"),
  branch: z.number().optional(),
  quotation: z.number().optional(),
  reference: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  due_date: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  terms: z.string().optional(),
  discount_type: z.enum(["fixed", "percentage"]).default("percentage"),
  discount_value: z.number().min(0).default(0),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>

const salesOrderItemSchema = z.object({
  product: z.number().min(1, "Product is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price must be positive"),
  discount: z.number().min(0).max(100).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
})

export const salesOrderSchema = z.object({
  customer: z.number().min(1, "Customer is required"),
  quotation: z.number().optional(),
  branch: z.number().optional(),
  reference: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  expected_delivery_date: z.string().optional(),
  notes: z.string().optional(),
  shipping_address: z.string().optional(),
  items: z.array(salesOrderItemSchema).min(1, "At least one item is required"),
})

export type SalesOrderInput = z.infer<typeof salesOrderSchema>

const purchaseOrderItemSchema = z.object({
  product: z.number().min(1, "Product is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price must be positive"),
  discount: z.number().min(0).max(100).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
})

export const purchaseOrderSchema = z.object({
  supplier: z.number().min(1, "Supplier is required"),
  branch: z.number().optional(),
  reference: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  expected_delivery_date: z.string().optional(),
  notes: z.string().optional(),
  shipping_address: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, "At least one item is required"),
})

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>

export const paymentSchema = z.object({
  invoice: z.number().optional(),
  customer: z.number().optional(),
  supplier: z.number().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  payment_method: z.enum(["cash", "bank_transfer", "check", "card", "other"]),
  payment_date: z.string().min(1, "Payment date is required"),
  reference: z.string().optional(),
  notes: z.string().optional(),
  account: z.number().optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>

export const journalEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  reference: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  lines: z
    .array(
      z.object({
        account: z.number().min(1, "Account is required"),
        debit: z.number().min(0).default(0),
        credit: z.number().min(0).default(0),
        description: z.string().optional(),
      })
    )
    .min(2, "At least two lines are required"),
})

export type JournalEntryInput = z.infer<typeof journalEntrySchema>

export const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  code: z.string().min(1, "Account code is required"),
  type: z.enum(["asset", "liability", "equity", "income", "expense"]),
  parent: z.number().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type AccountInput = z.infer<typeof accountSchema>

export const leadSchema = z.object({
  name: z.string().min(1, "Lead name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "unqualified"]).default("new"),
  assigned_to: z.number().optional(),
  notes: z.string().optional(),
})

export type LeadInput = z.infer<typeof leadSchema>

export const opportunitySchema = z.object({
  name: z.string().min(1, "Opportunity name is required"),
  lead: z.number().optional(),
  customer: z.number().optional(),
  value: z.number().min(0).default(0),
  stage: z
    .enum(["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"])
    .default("prospecting"),
  probability: z.number().min(0).max(100).default(0),
  expected_close_date: z.string().optional(),
  assigned_to: z.number().optional(),
  notes: z.string().optional(),
})

export type OpportunityInput = z.infer<typeof opportunitySchema>

export const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  avatar: z.any().optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const payrollPeriodSchema = z.object({
  name: z.string().min(1, "Period name is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.enum(["draft", "processing", "completed", "closed"]).default("draft"),
})

export type PayrollPeriodInput = z.infer<typeof payrollPeriodSchema>

export const salaryStructureSchema = z.object({
  employee: z.number().min(1, "Employee is required"),
  basic_salary: z.number().min(0, "Basic salary must be positive"),
  allowances: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  effective_from: z.string().min(1, "Effective from date is required"),
  effective_to: z.string().optional(),
  notes: z.string().optional(),
})

export type SalaryStructureInput = z.infer<typeof salaryStructureSchema>

export const stockAdjustmentSchema = z.object({
  product: z.number().min(1, "Product is required"),
  warehouse: z.number().min(1, "Warehouse is required"),
  adjustment_type: z.enum(["add", "subtract", "set"]),
  quantity: z.number().min(0, "Quantity must be positive"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
})

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>

export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
})

export type SearchInput = z.infer<typeof searchSchema>

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  page_size: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  ordering: z.string().optional(),
})

export type PaginationInput = z.infer<typeof paginationSchema>
