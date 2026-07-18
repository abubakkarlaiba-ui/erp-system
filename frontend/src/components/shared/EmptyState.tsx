import type { ReactNode, ElementType } from "react"

interface EmptyStateProps {
  icon: ElementType
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 p-12 dark:border-zinc-700">
      <Icon className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-center text-sm text-zinc-500">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
export default EmptyState
