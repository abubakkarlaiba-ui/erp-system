"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Download,
  FileText,
  TrendingUp,
  Truck,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePie,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useQuery } from "@tanstack/react-query"
import PageHeader from "@/components/layout/PageHeader"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/authStore"

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

function StatBox({ icon, title, value, bg }: { icon: React.ReactNode; title: string; value: string; bg?: string }) {
  return (
    <div className={"rounded-xl border p-5 " + (bg || "bg-white") + " dark:border-zinc-700 dark:bg-zinc-800"}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-3 dark:bg-zinc-700">{icon}</div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user)
  const [activeReport, setActiveReport] = useState("revenue")

  const { data: invoicesData } = useQuery({
    queryKey: ["reports-invoices"],
    queryFn: () => api.get("/accounting/invoices/?page_size=200").then((r) => r.data?.results ?? []),
  })
  const { data: expensesData } = useQuery({
    queryKey: ["reports-expenses"],
    queryFn: () => api.get("/accounting/expenses/?page_size=200").then((r) => r.data?.results ?? []),
  })
  const { data: customersData } = useQuery({
    queryKey: ["reports-customers"],
    queryFn: () => api.get("/sales/customers/?page_size=200").then((r) => r.data?.results ?? []),
  })
  const { data: productsData } = useQuery({
    queryKey: ["reports-products"],
    queryFn: () => api.get("/inventory/products/?page_size=200").then((r) => r.data?.results ?? []),
  })
  const { data: employeesData } = useQuery({
    queryKey: ["reports-employees"],
    queryFn: () => api.get("/employees/employees/?page_size=200").then((r) => r.data?.results ?? []),
  })
  const { data: suppliersData } = useQuery({
    queryKey: ["reports-suppliers"],
    queryFn: () => api.get("/purchase/suppliers/?page_size=200").then((r) => r.data?.results ?? []),
  })

  const invoices = useMemo(() => (Array.isArray(invoicesData) ? invoicesData : []), [invoicesData])
  const expenses = useMemo(() => (Array.isArray(expensesData) ? expensesData : []), [expensesData])
  const customers = useMemo(() => (Array.isArray(customersData) ? customersData : []), [customersData])
  const products = useMemo(() => (Array.isArray(productsData) ? productsData : []), [productsData])
  const employees = useMemo(() => (Array.isArray(employeesData) ? employeesData : []), [employeesData])
  const suppliers = useMemo(() => (Array.isArray(suppliersData) ? suppliersData : []), [suppliersData])

  const stats = useMemo(() => {
    const totalRevenue = invoices.filter((i: any) => i.invoice_type === "sales").reduce((s: number, i: any) => s + (Number(i.total) || 0), 0)
    const totalExpenses = expenses.reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0)
    return {
      totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses,
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter((i: any) => i.status === "paid").length,
      activeCustomers: customers.filter((c: any) => c.is_active !== false).length,
      activeProducts: products.filter((p: any) => p.is_active !== false).length,
      activeEmployees: employees.filter((e: any) => e.is_active !== false).length,
      totalSuppliers: suppliers.length,
    }
  }, [invoices, expenses, customers, products, employees, suppliers])

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const now = new Date()
    const result: { month: string; revenue: number; expenses: number; profit: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mi = d.getMonth(), yr = d.getFullYear()
      const rev = invoices.filter((inv: any) => { try { const id = new Date(inv.date); return inv.invoice_type === "sales" && id.getMonth() === mi && id.getFullYear() === yr } catch { return false } }).reduce((s: number, inv: any) => s + (Number(inv.total) || 0), 0)
      const exp = expenses.filter((e: any) => { try { const ed = new Date(e.date); return ed.getMonth() === mi && ed.getFullYear() === yr } catch { return false } }).reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0)
      result.push({ month: months[mi], revenue: rev, expenses: exp, profit: rev - exp })
    }
    return result
  }, [invoices, expenses])

  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {}
    invoices.filter((i: any) => i.invoice_type === "sales").forEach((inv: any) => {
      const name = inv.customer_name || "Unknown"
      catMap[name] = (catMap[name] || 0) + (Number(inv.total) || 0)
    })
    const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 7)
    const total = sorted.reduce((s, [, v]) => s + v, 0) || 1
    return sorted.map(([name, value], i) => ({ name, value: Math.round((value / total) * 100), color: COLORS[i % COLORS.length] }))
  }, [invoices])

  const topProducts = useMemo(() => products.slice(0, 8).map((p: any) => ({
    name: p.name || "Unknown", stock: Number(p.stock_quantity) || 0,
    price: Number(p.selling_price) || Number(p.price) || 0,
    category: p.category_name || p.category || "Uncategorized",
  })), [products])

  const employeeByDept = useMemo(() => {
    const m: Record<string, number> = {}
    employees.forEach((e: any) => { const d = e.department_name || e.department || "Unassigned"; m[d] = (m[d] || 0) + 1 })
    return Object.entries(m).map(([name, count], i) => ({ name, count, color: COLORS[i % COLORS.length] }))
  }, [employees])

  const invoiceStatusData = useMemo(() => {
    const m: Record<string, number> = {}
    invoices.forEach((inv: any) => { const st = inv.status || "draft"; m[st] = (m[st] || 0) + 1 })
    const cm: Record<string, string> = { draft: "#94a3b8", pending: "#f59e0b", sent: "#3b82f6", paid: "#22c55e", partial: "#8b5cf6", overdue: "#ef4444", cancelled: "#6b7280" }
    return Object.entries(m).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: cm[name] || "#6b7280" }))
  }, [invoices])

  const fmt = (n: number) => {
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "k"
    return "$" + n.toFixed(0)
  }

  const exportCSV = () => {
    let headers: string[] = [], rows: (string | number)[][] = []
    if (activeReport === "revenue") { headers = ["Month", "Revenue", "Expenses", "Profit"]; rows = monthlyData.map((r) => [r.month, r.revenue, r.expenses, r.profit]) }
    else if (activeReport === "sales") { headers = ["Customer", "Share (%)"]; rows = categoryData.map((r) => [r.name, r.value]) }
    else if (activeReport === "inventory") { headers = ["Product", "Stock", "Price", "Category"]; rows = topProducts.map((p) => [p.name, p.stock, p.price, p.category]) }
    else if (activeReport === "employees") { headers = ["Department", "Count"]; rows = employeeByDept.map((d) => [d.name, d.count]) }
    else if (activeReport === "invoices") { headers = ["Status", "Count"]; rows = invoiceStatusData.map((s) => [s.name, s.value]) }
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = activeReport + "-report-" + new Date().toISOString().split("T")[0] + ".csv"; a.click(); URL.revokeObjectURL(url)
  }

  const REPORT_TYPES = [
    { id: "revenue", label: "Revenue Report", icon: DollarSign },
    { id: "sales", label: "Sales Report", icon: ShoppingCart },
    { id: "inventory", label: "Inventory Report", icon: Package },
    { id: "employees", label: "Employee Report", icon: Users },
    { id: "invoices", label: "Invoice Report", icon: FileText },
  ]

  const tooltipStyle = { borderRadius: "0.5rem", border: "1px solid var(--border)", background: "var(--card)" }
  const empStatus = (active: boolean) => active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
  const invStatus = (status: string) => status === "paid" ? "bg-green-100 text-green-700" : status === "overdue" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
  const btnClass = (id: string) => "flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors " + (activeReport === id ? "border-primary bg-primary text-primary-foreground" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400")

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <PageHeader title="Reports & Analytics" description={"Data for " + (user?.company_name || "your company")} />
        <button onClick={exportCSV} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          <Download className="h-4 w-4" /> Export Report
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2">
        {REPORT_TYPES.map((report) => (
          <button key={report.id} onClick={() => setActiveReport(report.id)} className={btnClass(report.id)}>
            <report.icon className="h-4 w-4" />{report.label}
          </button>
        ))}
      </motion.div>

      {activeReport === "revenue" && (<>
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox icon={<DollarSign className="h-5 w-5 text-indigo-600" />} title="Total Revenue" value={fmt(stats.totalRevenue)} bg="bg-indigo-50 dark:bg-indigo-950" />
          <StatBox icon={<TrendingUp className="h-5 w-5 text-emerald-600" />} title="Total Expenses" value={fmt(stats.totalExpenses)} bg="bg-emerald-50 dark:bg-emerald-950" />
          <StatBox icon={<DollarSign className="h-5 w-5 text-green-600" />} title="Net Profit" value={fmt(stats.netProfit)} bg="bg-green-50 dark:bg-green-950" />
          <StatBox icon={<FileText className="h-5 w-5 text-amber-600" />} title="Paid Invoices" value={stats.paidInvoices + " / " + stats.totalInvoices} bg="bg-amber-50 dark:bg-amber-950" />
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Revenue vs Expenses (Last 6 Months)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: "currentColor" }} />
                <YAxis className="text-xs" tick={{ fill: "currentColor" }} tickFormatter={(v: number) => fmt(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmt(v), ""]} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="transparent" name="Expenses" />
                <Area type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} fill="transparent" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </>)}

      {activeReport === "sales" && (<>
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox icon={<ShoppingCart className="h-5 w-5 text-indigo-600" />} title="Total Invoices" value={String(stats.totalInvoices)} bg="bg-indigo-50 dark:bg-indigo-950" />
          <StatBox icon={<DollarSign className="h-5 w-5 text-emerald-600" />} title="Total Sales" value={fmt(stats.totalRevenue)} bg="bg-emerald-50 dark:bg-emerald-950" />
          <StatBox icon={<Users className="h-5 w-5 text-sky-600" />} title="Active Customers" value={String(stats.activeCustomers)} bg="bg-sky-50 dark:bg-sky-950" />
          <StatBox icon={<Truck className="h-5 w-5 text-amber-600" />} title="Suppliers" value={String(stats.totalSuppliers)} bg="bg-amber-50 dark:bg-amber-950" />
        </motion.div>
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="mb-4 text-lg font-semibold">Sales by Customer</h2>
            <div className="h-72">
              {categoryData.length > 0 ? (<ResponsiveContainer width="100%" height="100%"><RePie>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, index) => (<Cell key={"c" + index} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v + "%", "Share"]} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-gray-500">{value}</span>} />
              </RePie></ResponsiveContainer>) : <div className="flex h-full items-center justify-center text-sm text-gray-400">No sales data yet</div>}
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="mb-4 text-lg font-semibold">Invoice Status</h2>
            <div className="h-72">
              {invoiceStatusData.length > 0 ? (<ResponsiveContainer width="100%" height="100%"><BarChart data={invoiceStatusData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: "currentColor" }} />
                <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                  {invoiceStatusData.map((entry, index) => (<Cell key={"c" + index} fill={entry.color} />))}
                </Bar>
              </BarChart></ResponsiveContainer>) : <div className="flex h-full items-center justify-center text-sm text-gray-400">No invoice data yet</div>}
            </div>
          </motion.div>
        </div>
      </>)}

      {activeReport === "inventory" && (<>
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox icon={<Package className="h-5 w-5 text-indigo-600" />} title="Total Products" value={String(stats.activeProducts)} bg="bg-indigo-50 dark:bg-indigo-950" />
          <StatBox icon={<DollarSign className="h-5 w-5 text-emerald-600" />} title="Products w/ Price" value={String(products.filter((p: any) => Number(p.selling_price) > 0).length)} bg="bg-emerald-50 dark:bg-emerald-950" />
          <StatBox icon={<Package className="h-5 w-5 text-amber-600" />} title="Low Stock" value={String(products.filter((p: any) => (Number(p.stock_quantity) || 0) <= 10).length)} bg="bg-amber-50 dark:bg-amber-950" />
          <StatBox icon={<Package className="h-5 w-5 text-red-600" />} title="Out of Stock" value={String(products.filter((p: any) => (Number(p.stock_quantity) || 0) === 0).length)} bg="bg-red-50 dark:bg-red-950" />
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500"><th className="pb-3 font-medium">Product</th><th className="pb-3 font-medium text-right">Stock</th><th className="pb-3 font-medium text-right">Price</th><th className="pb-3 font-medium">Category</th></tr></thead>
              <tbody>
                {topProducts.length > 0 ? topProducts.map((p) => (
                  <tr key={p.name} className="border-b last:border-0">
                    <td className="py-3 font-medium">{p.name}</td>
                    <td className="py-3 text-right"><span className={p.stock === 0 ? "text-red-600 font-medium" : p.stock <= 10 ? "text-amber-600" : ""}>{p.stock}</span></td>
                    <td className="py-3 text-right">${p.price.toLocaleString()}</td>
                    <td className="py-3 text-gray-500">{p.category}</td>
                  </tr>
                )) : <tr><td colSpan={4} className="py-8 text-center text-gray-400">No products yet</td></tr>}
              </tbody>
            </table>
          </div>
        </motion.div>
      </>)}

      {activeReport === "employees" && (<>
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox icon={<Users className="h-5 w-5 text-indigo-600" />} title="Total Employees" value={String(stats.activeEmployees)} bg="bg-indigo-50 dark:bg-indigo-950" />
          <StatBox icon={<Users className="h-5 w-5 text-emerald-600" />} title="Active" value={String(employees.filter((e: any) => e.is_active).length)} bg="bg-emerald-50 dark:bg-emerald-950" />
          <StatBox icon={<Users className="h-5 w-5 text-amber-600" />} title="Inactive" value={String(employees.filter((e: any) => !e.is_active).length)} bg="bg-amber-50 dark:bg-amber-950" />
          <StatBox icon={<Package className="h-5 w-5 text-sky-600" />} title="Departments" value={String(employeeByDept.length)} bg="bg-sky-50 dark:bg-sky-950" />
        </motion.div>
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="mb-4 text-lg font-semibold">Employees by Department</h2>
            <div className="h-72">
              {employeeByDept.length > 0 ? (<ResponsiveContainer width="100%" height="100%"><RePie>
                <Pie data={employeeByDept} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="count" nameKey="name">
                  {employeeByDept.map((entry, index) => (<Cell key={"c" + index} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-gray-500">{value}</span>} />
              </RePie></ResponsiveContainer>) : <div className="flex h-full items-center justify-center text-sm text-gray-400">No employees yet</div>}
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="mb-4 text-lg font-semibold">Employee List</h2>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="pb-3 font-medium">Name</th><th className="pb-3 font-medium">Department</th><th className="pb-3 font-medium">Status</th></tr></thead>
                <tbody>
                  {employees.length > 0 ? employees.map((e: any) => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{e.first_name} {e.last_name}</td>
                      <td className="py-3 text-gray-500">{e.department_name || e.department || "-"}</td>
                      <td className="py-3"><span className={"inline-flex items-center rounded-full px-2 py-1 text-xs font-medium " + empStatus(e.is_active)}>{e.is_active ? "Active" : "Inactive"}</span></td>
                    </tr>
                  )) : <tr><td colSpan={3} className="py-8 text-center text-gray-400">No employees yet</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </>)}

      {activeReport === "invoices" && (<>
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox icon={<FileText className="h-5 w-5 text-indigo-600" />} title="Total Invoices" value={String(stats.totalInvoices)} bg="bg-indigo-50 dark:bg-indigo-950" />
          <StatBox icon={<DollarSign className="h-5 w-5 text-emerald-600" />} title="Total Billed" value={fmt(invoices.reduce((s: number, i: any) => s + (Number(i.total) || 0), 0))} bg="bg-emerald-50 dark:bg-emerald-950" />
          <StatBox icon={<DollarSign className="h-5 w-5 text-green-600" />} title="Total Collected" value={fmt(invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + (Number(i.total) || 0), 0))} bg="bg-green-50 dark:bg-green-950" />
          <StatBox icon={<FileText className="h-5 w-5 text-red-600" />} title="Outstanding" value={fmt(invoices.filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + ((Number(i.total) || 0) - (Number(i.amount_paid) || 0)), 0))} bg="bg-red-50 dark:bg-red-950" />
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Invoice Status Breakdown</h2>
          <div className="h-72">
            {invoiceStatusData.length > 0 ? (<ResponsiveContainer width="100%" height="100%"><RePie>
              <Pie data={invoiceStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                {invoiceStatusData.map((entry, index) => (<Cell key={"c" + index} fill={entry.color} />))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [String(v), "Invoices"]} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-gray-500">{value}</span>} />
            </RePie></ResponsiveContainer>) : <div className="flex h-full items-center justify-center text-sm text-gray-400">No invoices yet</div>}
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Recent Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500"><th className="pb-3 font-medium">Invoice #</th><th className="pb-3 font-medium">Customer</th><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium text-right">Total</th><th className="pb-3 font-medium">Status</th></tr></thead>
              <tbody>
                {invoices.length > 0 ? invoices.slice(0, 10).map((inv: any) => (
                  <tr key={inv.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{inv.invoice_number || "-"}</td>
                    <td className="py-3">{inv.customer_name || "-"}</td>
                    <td className="py-3 text-gray-500">{inv.date || "-"}</td>
                    <td className="py-3 text-right font-mono">${Number(inv.total || 0).toLocaleString()}</td>
                    <td className="py-3"><span className={"inline-flex items-center rounded-full px-2 py-1 text-xs font-medium " + invStatus(inv.status)}>{inv.status}</span></td>
                  </tr>
                )) : <tr><td colSpan={5} className="py-8 text-center text-gray-400">No invoices yet</td></tr>}
              </tbody>
            </table>
          </div>
        </motion.div>
      </>)}
    </motion.div>
  )
}
