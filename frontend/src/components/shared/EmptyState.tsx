import type { ReactNode, ElementType } from "react"

interface EmptyStateAction {
  label?: string
  onClick?: () => void
  icon?: ElementType
}

interface EmptyStateProps {
  icon: ElementType
  title: string
  description?: string
  action?: ReactNode | EmptyStateAction
}

function isActionObject(action: ReactNode | EmptyStateAction): action is EmptyStateAction {
  return typeof action === "object" && action !== null && !("props" in action) && "label" in action
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
      {action && (
        <div className="mt-4">
          {isActionObject(action) ? (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  )
}
export default EmptyState
