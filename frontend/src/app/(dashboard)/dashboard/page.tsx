"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  Package,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Clock,
  ShoppingCart,
  UserPlus,
  FilePlus,
  ClipboardList,
  BarChart3,
  Activity,
  CheckCircle,
  Circle,
} from "lucide-react";
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
} from "recharts";
import { format } from "date-fns";
import StatsCard from "@/components/shared/StatsCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const revenueData = [
  { month: "Jan", revenue: 42000, expenses: 32000 },
  { month: "Feb", revenue: 48000, expenses: 35000 },
  { month: "Mar", revenue: 55000, expenses: 38000 },
  { month: "Apr", revenue: 51000, expenses: 36000 },
  { month: "May", revenue: 62000, expenses: 41000 },
  { month: "Jun", revenue: 68000, expenses: 44000 },
];

const categoryData = [
  { name: "Electronics", value: 35, color: "#6366f1" },
  { name: "Clothing", value: 25, color: "#22c55e" },
  { name: "Food & Beverage", value: 20, color: "#f59e0b" },
  { name: "Home & Garden", value: 12, color: "#ef4444" },
  { name: "Other", value: 8, color: "#8b5cf6" },
];

const recentActivity = [
  {
    id: 1,
    icon: ShoppingCart,
    message: "New order #1234 placed by John Doe",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    type: "success" as const,
  },
  {
    id: 2,
    icon: UserPlus,
    message: "Employee Sarah Connor added to Engineering",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    type: "info" as const,
  },
  {
    id: 3,
    icon: FilePlus,
    message: "Invoice #INV-089 generated for Acme Corp",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    type: "info" as const,
  },
  {
    id: 4,
    icon: ClipboardList,
    message: "Purchase order #PO-456 approved",
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    type: "success" as const,
  },
  {
    id: 5,
    icon: AlertTriangle,
    message: "Low stock alert for Widget Pro X",
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    type: "warning" as const,
  },
];

const lowStockItems = [
  { name: "Widget Pro X", sku: "WPX-001", current: 8, reorder: 25 },
  { name: "Gadget Mini", sku: "GMN-042", current: 3, reorder: 15 },
  { name: "Cable HDMI 2.1", sku: "CHD-100", current: 12, reorder: 50 },
  { name: "Power Supply 650W", sku: "PSU-650", current: 5, reorder: 20 },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Q2 Financial Review",
    time: new Date(new Date().setHours(14, 0, 0, 0)),
    type: "meeting" as const,
  },
  {
    id: 2,
    title: "Inventory Audit",
    time: new Date(new Date().setDate(new Date().getDate() + 1)),
    type: "audit" as const,
  },
  {
    id: 3,
    title: "Team Standup",
    time: new Date(new Date().setDate(new Date().getDate() + 1)),
    type: "meeting" as const,
  },
  {
    id: 4,
    title: "Vendor Contract Renewal",
    time: new Date(new Date().setDate(new Date().getDate() + 3)),
    type: "deadline" as const,
  },
];

const attendanceData = [
  { status: "Present", count: 42, color: "text-green-600 dark:text-green-400" },
  { status: "Absent", count: 3, color: "text-red-600 dark:text-red-400" },
  { status: "Remote", count: 8, color: "text-blue-600 dark:text-blue-400" },
  { status: "On Leave", count: 5, color: "text-amber-600 dark:text-amber-400" },
];

const quickActions = [
  { label: "New Order", icon: ShoppingCart, href: "/orders/new" },
  { label: "Add Employee", icon: UserPlus, href: "/employees/new" },
  { label: "Create Invoice", icon: FilePlus, href: "/invoices/new" },
  { label: "View Reports", icon: BarChart3, href: "/reports" },
  { label: "Inventory", icon: Package, href: "/inventory" },
  { label: "Attendance", icon: ClipboardList, href: "/attendance" },
];

export default function DashboardPage() {
  const today = new Date();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          {format(today, "EEEE, MMMM d, yyyy")}
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard
          title="Total Revenue"
          value="$326,000"
          description="+12.5% from last month"
          icon={DollarSign}
          color="indigo"
          change={12.5}
        />
        <StatsCard
          title="Total Employees"
          value="58"
          description="+3 new this month"
          icon={Users}
          color="emerald"
          change={3}
        />
        <StatsCard
          title="Active Products"
          value="1,247"
          description="-2 discontinued"
          icon={Package}
          color="amber"
          change={-2}
        />
        <StatsCard
          title="Pending Invoices"
          value="23"
          description="$45,200 outstanding"
          icon={FileText}
          color="rose"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-7">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-4 rounded-xl border bg-card p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Revenue & Expenses</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6366f1]" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                Expenses
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="lg:col-span-3 rounded-xl border bg-card p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Sales by Category</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                  }}
                  formatter={(value: number) => [`${value}%`, "Share"]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          variants={itemVariants}
          className="rounded-xl border bg-card p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      item.type === "success"
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : item.type === "warning"
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{item.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {format(item.timestamp, "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-xl border bg-card p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Low Stock Alerts</h2>
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {item.current} units
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reorder at {item.reorder}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          variants={itemVariants}
          className="rounded-xl border bg-card p-6"
        >
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Upcoming Events
          </h2>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <Circle className="mt-1 h-2 w-2 shrink-0 fill-current" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(event.time, "EEE, MMM d • h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-xl border bg-card p-6"
        >
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Today&apos;s Attendance
          </h2>
          <div className="space-y-3">
            {attendanceData.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.status}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${
                        item.status === "Present"
                          ? "bg-green-500"
                          : item.status === "Absent"
                            ? "bg-red-500"
                            : item.status === "Remote"
                              ? "bg-blue-500"
                              : "bg-amber-500"
                      }`}
                      style={{
                        width: `${(item.count / 58) * 100}%`,
                      }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${item.color}`}>
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Total: 58 employees
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-xl border bg-card p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
