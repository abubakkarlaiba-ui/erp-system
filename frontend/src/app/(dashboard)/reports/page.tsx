"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  FileText,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
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
} from "recharts";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const monthlyRevenue = [
  { month: "Jan", revenue: 42000, expenses: 32000, profit: 10000 },
  { month: "Feb", revenue: 48000, expenses: 35000, profit: 13000 },
  { month: "Mar", revenue: 55000, expenses: 38000, profit: 17000 },
  { month: "Apr", revenue: 51000, expenses: 36000, profit: 15000 },
  { month: "May", revenue: 62000, expenses: 41000, profit: 21000 },
  { month: "Jun", revenue: 68000, expenses: 44000, profit: 24000 },
];

const salesByCategory = [
  { name: "Electronics", value: 35, color: "#6366f1" },
  { name: "Clothing", value: 25, color: "#22c55e" },
  { name: "Food & Beverage", value: 20, color: "#f59e0b" },
  { name: "Home & Garden", value: 12, color: "#ef4444" },
  { name: "Other", value: 8, color: "#8b5cf6" },
];

const topProducts = [
  { name: "Wireless Headphones", sales: 342, revenue: 51300 },
  { name: "Smart Watch Pro", sales: 287, revenue: 43050 },
  { name: "USB-C Hub", sales: 254, revenue: 17780 },
  { name: "Mechanical Keyboard", sales: 198, revenue: 29700 },
  { name: "4K Monitor", sales: 156, revenue: 62400 },
];

const REPORT_TYPES = [
  { id: "revenue", label: "Revenue Report", icon: DollarSign },
  { id: "sales", label: "Sales Report", icon: ShoppingCart },
  { id: "inventory", label: "Inventory Report", icon: Package },
  { id: "employees", label: "Employee Report", icon: Users },
  { id: "invoices", label: "Invoice Report", icon: FileText },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState("revenue");

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <PageHeader title="Reports & Analytics" />
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          <Download className="h-4 w-4" /> Export Report
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2">
        {REPORT_TYPES.map((report) => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              activeReport === report.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <report.icon className="h-4 w-4" />
            {report.label}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Revenue" value="$326,000" icon={<DollarSign className="h-5 w-5" />} color="indigo" change={12.5} />
        <StatsCard title="Total Orders" value="1,847" icon={<ShoppingCart className="h-5 w-5" />} color="emerald" change={8.3} />
        <StatsCard title="Products Sold" value="4,231" icon={<Package className="h-5 w-5" />} color="amber" change={-2.1} />
        <StatsCard title="Active Customers" value="312" icon={<Users className="h-5 w-5" />} color="sky" change={5.7} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants} className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Revenue Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: "currentColor" }} />
                <YAxis className="text-xs" tick={{ fill: "currentColor" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid var(--border)", background: "var(--card)" }} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Sales by Category</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RePie>
                <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid var(--border)", background: "var(--card)" }} formatter={(v: number) => [`${v}%`, "Share"]} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
              </RePie>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium text-right">Units Sold</th>
                <th className="pb-3 font-medium text-right">Revenue</th>
                <th className="pb-3 font-medium text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, i) => (
                <tr key={product.name} className="border-b last:border-0">
                  <td className="py-3 font-medium">{product.name}</td>
                  <td className="py-3 text-right">{product.sales.toLocaleString()}</td>
                  <td className="py-3 text-right">${product.revenue.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <ArrowUpRight className="h-3 w-3" />
                      {Math.floor(Math.random() * 20 + 1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
