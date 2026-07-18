"use client"

import { useState, useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from "@tanstack/react-table"
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  pagination?: boolean
  onSearch?: (value: string) => void
  onFilter?: (filters: Record<string, string>) => void
  onSort?: (sorting: SortingState) => void
  bulkActions?: {
    onDelete?: (selected: TData[]) => void
    onExport?: (selected: TData[]) => void
  }
  emptyState?: {
    icon?: React.ElementType
    title: string
    description?: string
  }
}

export function DataTable<TData extends { id?: string | number }>({
  columns,
  data,
  isLoading,
  pagination: showPagination = true,
  onSearch,
  bulkActions,
  emptyState,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)

  const selectedRows = useMemo(() => {
    return table.getSelectedRowModel().rows.map((r) => r.original)
  }, [rowSelection])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater
      setPageIndex(next.pageIndex)
      setPageSize(next.pageSize)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: !!bulkActions,
    getRowId: (row) => String(row.id ?? Math.random()),
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="p-4">
          <div className="h-10 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-t border-zinc-200 p-4 dark:border-zinc-800">
            <div className="h-4 w-4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            {columns.map((_, ci) => (
              <div
                key={ci}
                className="h-4 flex-1 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    const EmptyIcon = emptyState?.icon
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 p-12 dark:border-zinc-700">
        {EmptyIcon && (
          <EmptyIcon className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
        )}
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          {emptyState?.title || "No data"}
        </h3>
        {emptyState?.description && (
          <p className="mt-1 text-sm text-zinc-500">{emptyState.description}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value)
              onSearch?.(e.target.value)
            }}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
        {bulkActions && selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">
              {selectedRows.length} selected
            </span>
            {bulkActions.onDelete && (
              <button
                onClick={() => bulkActions.onDelete!(selectedRows)}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
            {bulkActions.onExport && (
              <button
                onClick={() => bulkActions.onExport!(selectedRows)}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500",
                      header.column.getCanSort() && "cursor-pointer select-none"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <ChevronUp className="h-3.5 w-3.5" />,
                        desc: <ChevronDown className="h-3.5 w-3.5" />,
                      }[header.column.getIsSorted() as string] ??
                        (header.column.getCanSort() && (
                          <ChevronsUpDown className="h-3.5 w-3.5" />
                        ))}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-zinc-200 transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900",
                  row.getIsSelected() && "bg-indigo-50 dark:bg-indigo-950/30"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPageIndex(0)
              }}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default DataTable
