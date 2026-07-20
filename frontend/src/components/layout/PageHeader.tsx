import React from "react"
import Link from "next/link"
import { ChevronRight, Plus } from "lucide-react"

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderAction {
  label?: string
  onClick?: () => void
  icon?: React.ElementType
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode
  action?: PageHeaderAction
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  action,
}: PageHeaderProps) {
  const actionButton = action?.label ? (
    <button
      onClick={action.onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      {action.icon ? <action.icon className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {action.label}
    </button>
  ) : null

  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-1 text-sm text-zinc-500">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-zinc-900 dark:text-zinc-100">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {actionButton}
        </div>
      </div>
    </div>
  )
}
export default PageHeader
