"use client"

import { type ReactNode, type ElementType, isValidElement, createElement } from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: ReactNode | ElementType
  color?: "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet"
}

const colorMap = {
  indigo: { bg: "from-indigo-500/10 to-indigo-500/5", text: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-100 dark:bg-indigo-900/50" },
  emerald: { bg: "from-emerald-500/10 to-emerald-500/5", text: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900/50" },
  amber: { bg: "from-amber-500/10 to-amber-500/5", text: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-900/50" },
  rose: { bg: "from-rose-500/10 to-rose-500/5", text: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-100 dark:bg-rose-900/50" },
  sky: { bg: "from-sky-500/10 to-sky-500/5", text: "text-sky-600 dark:text-sky-400", iconBg: "bg-sky-100 dark:bg-sky-900/50" },
  violet: { bg: "from-violet-500/10 to-violet-500/5", text: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-100 dark:bg-violet-900/50" },
}

function renderIcon(icon: ReactNode | ElementType): ReactNode {
  if (isValidElement(icon)) return icon
  if (typeof icon === "function") return createElement(icon, { className: "h-5 w-5" })
  return null
}

export function StatsCard({ title, value, change, icon, color = "indigo" }: StatsCardProps) {
  const c = colorMap[color]
  const isPositive = change != null && change >= 0

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900")}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", c.bg)} />
      <div className="relative flex items-start justify-between">
        <div className={cn("rounded-lg p-2.5", c.iconBg)}>
          {renderIcon(icon)}
        </div>
        {change != null && (
          <div
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              isPositive
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="relative mt-4">
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {value}
        </p>
      </div>
    </div>
  )
}
export default StatsCard
