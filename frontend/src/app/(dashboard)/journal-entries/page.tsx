"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Send,
  XCircle,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/layout/DataTable";
import StatsCard from "@/components/shared/StatsCard";
import {
  accountingApi,
  JournalEntry,
  Account,
} from "@/features/accounting/api/accountingApi";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";

const lineSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  debit: z.coerce.number().min(0),
  credit: z.coerce.number().min(0),
  description: z.string().optional(),
});

const entrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  reference: z.string().min(1, "Reference is required"),
  description: z.string().min(1, "Description is required"),
  lines: z
    .array(lineSchema)
    .min(2, "At least two lines required")
    .refine(
      (lines) => {
        const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
        const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
        return Math.abs(totalDebit - totalCredit) < 0.01;
      },
      { message: "Debits must equal credits" }
    ),
});

type EntryFormData = z.infer<typeof entrySchema>;

const statusConfig: Record<string, { icon: any; color: string }> = {
  draft: { icon: FileText, color: "bg-gray-100 text-gray-800" },
  posted: { icon: CheckCircle2, color: "bg-green-100 text-green-800" },
  cancelled: { icon: XCircle, color: "bg-red-100 text-red-800" },
};

export default function JournalEntriesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: entriesData, isLoading } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: () => accountingApi.getJournalEntries({ perPage: 100, search }),
  });

  const { data: accountsData } = useQuery({
    queryKey: ["accounts-list"],
    queryFn: () => accountingApi.getAccounts({ perPage: 1000 }),
  });

  const createMutation = useMutation({
    mutationFn: accountingApi.createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      toast.success("Journal entry created");
      setDialogOpen(false);
      reset();
    },
    onError: () => toast.error("Failed to create entry"),
  });

  const postMutation = useMutation({
    mutationFn: accountingApi.postJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      toast.success("Entry posted");
    },
    onError: () => toast.error("Failed to post entry"),
  });

  const cancelMutation = useMutation({
    mutationFn: accountingApi.cancelJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      toast.success("Entry cancelled");
    },
    onError: () => toast.error("Failed to cancel entry"),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      reference: "",
      description: "",
      lines: [
        { accountId: "", debit: 0, credit: 0, description: "" },
        { accountId: "", debit: 0, credit: 0, description: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  const lines = watch("lines");
  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const accounts = accountsData?.data?.results ?? [];

  const entries = entriesData?.data?.results ?? [];
  const totalEntries = entriesData?.data?.count ?? entries.length;
  const draftCount = entries.filter((e) => e.status === "draft").length;
  const postedCount = entries.filter((e) => e.status === "posted").length;
  const thisMonthCount = entries.filter(
    (e) =>
      new Date(e.date).getMonth() === new Date().getMonth() &&
      new Date(e.date).getFullYear() === new Date().getFullYear()
  ).length;

  const onSubmit = (data: EntryFormData) => {
    createMutation.mutate(data);
  };

  const columns: ColumnDef<JournalEntry>[] = [
    { accessorKey: "entryNumber", header: "Entry #" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "debitTotal",
      header: "Debit",
      cell: ({ row }) => (
        <span className="font-mono">{formatCurrency(row.original.debitTotal)}</span>
      ),
    },
    {
      accessorKey: "creditTotal",
      header: "Credit",
      cell: ({ row }) => (
        <span className="font-mono">{formatCurrency(row.original.creditTotal)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status];
        const Icon = cfg.icon;
        return (
          <Badge variant="secondary" className={cn(cfg.color)}>
            <Icon className="h-3 w-3 mr-1" />
            {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const entry = row.original;
        return (
          <div className="flex items-center gap-1">
            {entry.status === "draft" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => postMutation.mutate(entry.id)}
                >
                  <Send className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => cancelMutation.mutate(entry.id)}
                >
                  <XCircle className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal Entries"
        action={{ label: "New Entry", icon: Plus, onClick: () => setDialogOpen(true) }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatsCard title="Total Entries" value={totalEntries} icon={FileText} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatsCard title="Draft" value={draftCount} icon={Clock} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatsCard title="Posted" value={postedCount} icon={CheckCircle2} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatsCard title="This Month" value={thisMonthCount} icon={AlertCircle} />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <DataTable
          columns={columns}
          data={entries}
          searchValue={search}
          onSearchChange={setSearch}
          isLoading={isLoading}
        />
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...register("date")} />
              </div>
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input {...register("reference")} placeholder="e.g. REF-001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...register("description")} placeholder="Entry description" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ accountId: "", debit: 0, credit: 0, description: "" })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Line
                </Button>
              </div>
              {errors.lines && (
                <p className="text-sm text-destructive">{errors.lines.message}</p>
              )}
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_100px_100px_40px] gap-2 px-3 py-2 bg-muted/30 text-sm font-medium">
                  <span>Account</span>
                  <span className="text-right">Debit</span>
                  <span className="text-right">Credit</span>
                  <span />
                </div>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_100px_100px_40px] gap-2 px-3 py-2 border-t items-center"
                  >
                    <Select
                      value={watch(`lines.${index}.accountId`)}
                      onValueChange={(v) => {
                        const lines = watch("lines");
                        lines[index].accountId = v;
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.code} - {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-right font-mono"
                      {...register(`lines.${index}.debit`)}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-right font-mono"
                      {...register(`lines.${index}.credit`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 2}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-8 text-sm font-medium pt-2">
                <span className="font-mono">
                  Debit: {formatCurrency(totalDebit)}
                </span>
                <span className="font-mono">
                  Credit: {formatCurrency(totalCredit)}
                </span>
                <span className={cn("font-mono", isBalanced ? "text-green-600" : "text-destructive")}>
                  {isBalanced ? "Balanced" : "Unbalanced"}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isBalanced}>
                Create Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
