"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  Calculator,
  Package,
  TrendingUp,
  ShoppingCart,
  Settings,
  ChevronDown,
  ChevronLeft,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/stores/uiStore"

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  items?: { label: string; href: string }[]
}

const navSections: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    label: "Company",
    icon: Building2,
    items: [
      { label: "Company", href: "/company" },
      { label: "Branches", href: "/company/branches" },
      { label: "Departments", href: "/company/departments" },
      { label: "Designations", href: "/company/designations" },
    ],
  },
  {
    label: "Employees",
    icon: Users,
    items: [
      { label: "Employee Directory", href: "/employees" },
      { label: "Documents", href: "/employees/documents" },
      { label: "Contracts", href: "/employees/contracts" },
    ],
  },
  {
    label: "HR",
    icon: Briefcase,
    items: [
      { label: "Attendance", href: "/hr/attendance" },
      { label: "Leave", href: "/hr/leave" },
      { label: "Payroll", href: "/hr/payroll" },
      { label: "Recruitment", href: "/hr/recruitment" },
      { label: "Training", href: "/hr/training" },
      { label: "Performance", href: "/hr/performance" },
    ],
  },
  {
    label: "Accounting",
    icon: Calculator,
    items: [
      { label: "Chart of Accounts", href: "/accounting/chart-of-accounts" },
      { label: "Journal Entries", href: "/accounting/journal-entries" },
      { label: "Invoices", href: "/accounting/invoices" },
      { label: "Payments", href: "/accounting/payments" },
      { label: "Expenses", href: "/accounting/expenses" },
      { label: "Bank Accounts", href: "/accounting/bank-accounts" },
      { label: "Budgets", href: "/accounting/budgets" },
      { label: "Fixed Assets", href: "/accounting/fixed-assets" },
    ],
  },
  {
    label: "Inventory",
    icon: Package,
    items: [
      { label: "Products", href: "/inventory/products" },
      { label: "Categories", href: "/inventory/categories" },
      { label: "Warehouses", href: "/inventory/warehouses" },
      { label: "Stock Movements", href: "/inventory/stock-movements" },
    ],
  },
  {
    label: "Sales",
    icon: TrendingUp,
    items: [
      { label: "Customers", href: "/sales/customers" },
      { label: "Leads", href: "/sales/leads" },
      { label: "Quotations", href: "/sales/quotations" },
      { label: "Sales Orders", href: "/sales/sales-orders" },
    ],
  },
  {
    label: "Purchase",
    icon: ShoppingCart,
    items: [
      { label: "Suppliers", href: "/purchase/suppliers" },
      { label: "Purchase Orders", href: "/purchase/purchase-orders" },
      { label: "Goods Receipt", href: "/purchase/goods-receipt" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    items: [
      { label: "Company Settings", href: "/settings/company" },
      { label: "System Settings", href: "/settings/system" },
    ],
  },
]

function SidebarItem({
  item,
  collapsed,
  isActive,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  isActive: boolean
  onNavigate?: () => void
}) {
  const [expanded, setExpanded] = useState(isActive)
  const pathname = usePathname()
  const hasItems = item.items && item.items.length > 0

  if (!hasItems) {
    return (
      <Link
        href={item.href!}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-indigo-500/10 text-indigo-400"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-indigo-500/10 text-indigo-400"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </>
        )}
      </button>
      <AnimatePresence initial={false}>
        {expanded && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-3 mt-1 border-l border-zinc-700 pl-3 space-y-1">
              {item.items!.map((subItem) => {
                const subActive = pathname === subItem.href
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-sm transition-colors",
                      subActive
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "text-zinc-400 hover:text-zinc-100"
                    )}
                  >
                    {subItem.label}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleSidebarCollapsed } = useUIStore()

  const sidebarContent = (
    <div
      className={cn(
        "flex h-full flex-col bg-zinc-950 border-r border-zinc-800 transition-all duration-300",
        sidebarCollapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <span className="text-sm font-bold text-white">E</span>
        </div>
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg font-semibold text-white"
          >
            ERP System
          </motion.span>
        )}
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto rounded-md p-1 text-zinc-400 hover:text-white md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navSections.map((section) => {
          const sectionActive = section.href
            ? pathname === section.href
            : section.items?.some((i) => pathname === i.href)
          return (
            <SidebarItem
              key={section.label}
              item={section}
              collapsed={sidebarCollapsed}
              isActive={!!sectionActive}
              onNavigate={() => setSidebarOpen(false)}
            />
          )
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3">
        <button
          onClick={toggleSidebarCollapsed}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              sidebarCollapsed && "rotate-180"
            )}
          />
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden md:sticky md:top-0 md:flex md:h-screen md:shrink-0">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full"
            >
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
export default Sidebar
