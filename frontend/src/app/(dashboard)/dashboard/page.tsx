"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  DollarSign,
  Users,
  Package,
  FileText,
  TrendingUp,
  ShoppingCart,
  UserPlus,
  FilePlus,
  ClipboardList,
  BarChart3,
  Activity,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { format } from "date-fns"
import StatsCard from "@/components/shared/StatsCard"
import { useQuery } from "@tanstack/react-query"
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

const quickActions = [
  { label: "New Order", icon: ShoppingCart, href: "/sales-orders/new" },
  { label: "Add Employee", icon: UserPlus, href: "/employees" },
  { label: "Create Invoice", icon: FilePlus, href: "/invoices" },
  { label: "View Reports", icon: BarChart3, href: "/reports" },
  { label: "Inventory", icon: Package, href: "/products" },
  { label: "Attendance", icon: ClipboardList, href: "/attendance" },
]

export default function DashboardPage() {
  const today = new Date()
  const user = useAuthStore((s) => s.user)

  const { data: invoicesData } = useQuery({
    queryKey: ["dash-invoices"],
    queryFn: () => api.get("/accounting/invoices/?page_size=200").then((r) => r.data?.results ?? []),
  })
  const { data: expensesData } = useQuery({
    queryKey: ["dash-expenses"],
    queryFn: () => api.get("/accounting/expenses/?page_size=200").then((r) => r.data?.results ?? []),
  })
  const { data: customersData } = useQuery({
    queryKey: ["dash-customers"],
    queryFn: () => api.get("/sales/customers/?page_size=200").then((r) => r.data?.results ?? []),
  })
  const { data: productsData } = useQuery({
    queryKey: ["dash-products"],
    queryFn: () => api.get("/inventory/products/?page_size=200").then((r) => r.data?.results ?? []),
  })
  const { data: employeesData } = useQuery({
    queryKey: ["dash-employees"],
    queryFn: () => api.get("/employees/employees/?page_size=200").then((r) => r.data?.results ?? []),
  })
  const { data: ordersData } = useQuery({
    queryKey: ["dash-orders"],
    queryFn: () => api.get("/sales/sales-orders/?page_size=200").then((r) => r.data?.results ?? []),
  })

  const invoices = useMemo(() => (Array.isArray(invoicesData) ? invoicesData : []), [invoicesData])
  const expenses = useMemo(() => (Array.isArray(expensesData) ? expensesData : []), [expensesData])
  const customers = useMemo(() => (Array.isArray(customersData) ? customersData : []), [customersData])
  const products = useMemo(() => (Array.isArray(productsData) ? productsData : []), [productsData])
  const employees = useMemo(() => (Array.isArray(employeesData) ? employeesData : []), [employeesData])
  const orders = useMemo(() => (Array.isArray(ordersData) ? ordersData : []), [ordersData])

  const stats = useMemo(() => {
    const totalRevenue = invoices.filter((i: any) => i.invoice_type === "sales").reduce((s: number, i: any) => s + (Number(i.total) || 0), 0)
    const totalExpenses = expenses.reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0)
    return {
      totalRevenue,
      totalExpenses,
      totalCustomers: customers.filter((c: any) => c.is_active !== false).length,
      totalOrders: orders.length,
      lowStockProducts: products.filter((p: any) => (Number(p.stock_quantity) || 0) <= 10).length,
      totalEmployees: employees.filter((e: any) => e.is_active !== false).length,
    }
  }, [invoices, expenses, customers, orders, products, employees])

  const revenueData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const mi = d.getMonth(), yr = d.getFullYear()
      const rev = invoices.filter((inv: any) => { try { const id = new Date(inv.date); return inv.invoice_type === "sales" && id.getMonth() === mi && id.getFullYear() === yr } catch { return false } }).reduce((s: number, inv: any) => s + (Number(inv.total) || 0), 0)
      const exp = expenses.filter((e: any) => { try { const ed = new Date(e.date); return ed.getMonth() === mi && ed.getFullYear() === yr } catch { return false } }).reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0)
      return { month: months[mi], revenue: rev, expenses: exp }
    })
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

  const lowStockItems = useMemo(() =>
    products.filter((p: any) => (Number(p.stock_quantity) || 0) <= 10).slice(0, 5).map((p: any) => ({
      name: p.name || "Unknown",
      sku: p.sku || "",
      current: Number(p.stock_quantity) || 0,
      reorder: Number(p.reorder_level) || 10,
    })), [products])

  const recentActivity = useMemo(() => {
    const activity: { icon: typeof ShoppingCart; message: string; time: Date; type: "success" | "info" | "warning" }[] = []
    invoices.slice(-5).reverse().forEach((inv: any) => {
      activity.push({ icon: FilePlus, message: "Invoice " + (inv.invoice_number || "#") + " for " + (inv.customer_name || "-"), time: new Date(inv.created_at || inv.date || Date.now()), type: "info" })
    })
    customers.slice(-3).reverse().forEach((c: any) => {
      activity.push({ icon: UserPlus, message: "Customer " + (c.name || "-") + " added", time: new Date(c.created_at || Date.now()), type: "success" })
    })
    products.slice(-3).reverse().forEach((p: any) => {
      if ((Number(p.stock_quantity) || 0) <= 10) {
        activity.push({ icon: Package, message: "Low stock: " + (p.name || "-") + " (" + (Number(p.stock_quantity) || 0) + " left)", time: new Date(p.updated_at || Date.now()), type: "warning" })
      }
    })
    return activity.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 6)
  }, [invoices, customers, products])

  const fmt = (n: number) => {
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "k"
    return "$" + n.toFixed(0)
  }

  const tooltipStyle = { borderRadius: "0.5rem", border: "1px solid var(--border)", background: "var(--card)" }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">{format(today, "EEEE, MMMM d, yyyy")} &mdash; {user?.company_name || "Your Company"}</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Revenue" value={fmt(stats.totalRevenue)} icon={<DollarSign className="h-5 w-5" />} color="indigo" />
        <StatsCard title="Total Customers" value={String(stats.totalCustomers)} icon={<Users className="h-5 w-5" />} color="emerald" />
        <StatsCard title="Sales Orders" value={String(stats.totalOrders)} icon={<Package className="h-5 w-5" />} color="amber" />
        <StatsCard title="Low Stock Items" value={String(stats.lowStockProducts)} icon={<FileText className="h-5 w-5" />} color="rose" />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-7">
        <motion.div variants={itemVariants} className="lg:col-span-4 rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Revenue & Expenses</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#6366f1]" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />Expenses</span>
            </div>
          </div>
          <div className="h-72">
            {revenueData.some((d) => d.revenue > 0 || d.expenses > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: "currentColor" }} />
                  <YAxis className="text-xs" tick={{ fill: "currentColor" }} tickFormatter={(v: number) => fmt(v)} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmt(v), ""]} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#22c55e" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">No revenue data yet. Create your first invoice to see the chart.</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-3 rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Sales by Customer</h2>
          <div className="h-72">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                    {categoryData.map((entry, index) => (<Cell key={"c" + index} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v + "%", "Share"]} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-gray-500">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">No sales data yet.</div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className={"mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full " + (item.type === "success" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : item.type === "warning" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400")}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{item.message}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{format(item.time, "MMM d, h:mm a")}</p>
                  </div>
                </div>
              )
            }) : <p className="text-sm text-gray-500">No recent activity.</p>}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Low Stock Alerts</h2>
          <div className="space-y-3">
            {lowStockItems.length > 0 ? lowStockItems.map((item) => (
              <div key={item.sku || item.name} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.sku || "No SKU"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">{item.current} units</p>
                  <p className="text-xs text-gray-500">Reorder at {item.reorder}</p>
                </div>
              </div>
            )) : <p className="text-sm text-gray-500">No low stock items.</p>}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2"><Activity className="h-5 w-5 text-gray-500" /> Workforce</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Total Employees</span><span className="text-sm font-semibold">{stats.totalEmployees}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Active Customers</span><span className="text-sm font-semibold">{stats.totalCustomers}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Total Orders</span><span className="text-sm font-semibold">{stats.totalOrders}</span></div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-gray-500" /> Financial Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Total Revenue</span><span className="text-sm font-semibold text-green-600">{fmt(stats.totalRevenue)}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Total Expenses</span><span className="text-sm font-semibold text-red-600">{fmt(stats.totalExpenses)}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Net Profit</span><span className="text-sm font-semibold">{fmt(stats.totalRevenue - stats.totalExpenses)}</span></div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-xl border bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <a key={action.label} href={action.href} className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-accent hover:text-accent-foreground">
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </a>
              )
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
