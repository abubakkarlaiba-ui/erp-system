"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import { accountingApi, type Budget } from "@/features/accounting/api/accountingApi";
import { companyApi } from "@/features/companies/api/companyApi";
import { useAuthStore } from "@/stores/authStore";
import { cn, formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const companyId = (user?.company as any)?.id;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("yearly");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const res = await accountingApi.getBudgets();
      return res.data;
    },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await accountingApi.getAccounts();
      return res.data;
    },
  });

  const { data: fiscalYears = [] } = useQuery({
    queryKey: ["fiscalYears", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await companyApi.getFiscalYears(companyId);
      return res.results ?? [];
    },
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      accountingApi.createBudget({
        accountId: selectedAccount,
        fiscalYearId: selectedFiscalYear,
        budgetAmount: Number(budgetAmount),
        period: selectedPeriod,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget created successfully");
      resetForm();
      setDialogOpen(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || "Failed to create budget";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountingApi.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete budget"),
  });

  const resetForm = () => {
    setSelectedAccount("");
    setSelectedFiscalYear(fiscalYears[0]?.id ?? "");
    setSelectedPeriod("yearly");
    setBudgetAmount("");
    setNotes("");
  };

  const totalBudget = budgets.reduce((s, b) => s + b.budgetAmount, 0);
  const totalActual = budgets.reduce((s, b) => s + b.actualAmount, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <PageHeader title="Budgets" />
        <button
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New Budget
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Total Budget" value={formatCurrency(totalBudget)} icon={<DollarSign className="h-5 w-5" />} color="indigo" />
        <StatsCard title="Total Actual" value={formatCurrency(totalActual)} icon={<TrendingDown className="h-5 w-5" />} color="amber" />
        <StatsCard title="Remaining" value={formatCurrency(totalBudget - totalActual)} icon={<TrendingUp className="h-5 w-5" />} color="emerald" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No budgets found. Create your first budget.</p>
        ) : (
          budgets.map((budget) => {
            const pct = budget.budgetAmount > 0 ? Math.round((budget.actualAmount / budget.budgetAmount) * 100) : 0;
            const overBudget = pct > 90;
            return (
              <div key={budget.id} className="rounded-xl border bg-white p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{budget.accountName}</h3>
                    <p className="text-xs text-gray-500">{budget.period} &middot; {budget.notes || "No notes"}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setDeleteId(budget.id)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mb-2 flex items-baseline justify-between text-sm">
                  <span className="font-medium">{formatCurrency(budget.actualAmount)}</span>
                  <span className="text-gray-500">of {formatCurrency(budget.budgetAmount)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full transition-all", overBudget ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500")}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{pct}% used</span>
                  {overBudget && (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertTriangle className="h-3 w-3" /> Near limit
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Account</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="mt-1">
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
            </div>
            <div>
              <Label>Fiscal Year</Label>
              <Select value={selectedFiscalYear} onValueChange={setSelectedFiscalYear}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select fiscal year" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map((fy: any) => (
                    <SelectItem key={fy.id} value={fy.id}>
                      {fy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Budget Amount</Label>
              <Input type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} className="mt-1" placeholder="0.00" />
            </div>
            <div>
              <Label>Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" placeholder="Optional notes" />
            </div>
            <DialogFooter>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!selectedAccount || !selectedFiscalYear || !budgetAmount || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this budget?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
