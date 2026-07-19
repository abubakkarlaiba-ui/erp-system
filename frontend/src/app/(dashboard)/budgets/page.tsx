"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import { api } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const budgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0, "Amount must be positive"),
  period: z.enum(["monthly", "quarterly", "yearly"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const sampleBudgets = [
  { id: "1", name: "Marketing Budget", category: "Marketing", amount: 50000, spent: 32000, period: "yearly" },
  { id: "2", name: "Office Supplies", category: "Operations", amount: 12000, spent: 8500, period: "yearly" },
  { id: "3", name: "Travel & Entertainment", category: "Operations", amount: 25000, spent: 18700, period: "yearly" },
  { id: "4", name: "Software Licenses", category: "IT", amount: 30000, spent: 28000, period: "yearly" },
  { id: "5", name: "Training & Development", category: "HR", amount: 15000, spent: 6000, period: "yearly" },
  { id: "6", name: "R&D Budget", category: "Engineering", amount: 100000, spent: 45000, period: "yearly" },
];

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { name: "", category: "", amount: 0, period: "yearly", startDate: "", endDate: "" },
  });

  const totalBudget = sampleBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = sampleBudgets.reduce((s, b) => s + b.spent, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <PageHeader title="Budgets" />
        <button onClick={() => { setEditingBudget(null); form.reset(); setDialogOpen(true); }} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Budget
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Total Budget" value={`$${totalBudget.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} color="indigo" />
        <StatsCard title="Total Spent" value={`$${totalSpent.toLocaleString()}`} icon={<TrendingDown className="h-5 w-5" />} color="amber" />
        <StatsCard title="Remaining" value={`$${(totalBudget - totalSpent).toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} color="emerald" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sampleBudgets.map((budget) => {
          const pct = Math.round((budget.spent / budget.amount) * 100);
          const overBudget = pct > 90;
          return (
            <div key={budget.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{budget.name}</h3>
                  <p className="text-xs text-muted-foreground">{budget.category} &middot; {budget.period}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingBudget(budget); form.reset(budget); setDialogOpen(true); }} className="rounded p-1 hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="mb-2 flex items-baseline justify-between text-sm">
                <span className="font-medium">{formatCurrency(budget.spent)}</span>
                <span className="text-muted-foreground">of {formatCurrency(budget.amount)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className={cn("h-full rounded-full transition-all", overBudget ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{pct}% used</span>
                {overBudget && <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="h-3 w-3" /> Near limit</span>}
              </div>
            </div>
          );
        })}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingBudget ? "Edit Budget" : "New Budget"}</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit((d) => { toast.success(editingBudget ? "Budget updated" : "Budget created"); setDialogOpen(false); })} className="space-y-4">
            <div><Label>Name</Label><Input {...form.register("name")} className="mt-1" /></div>
            <div><Label>Category</Label><Input {...form.register("category")} className="mt-1" /></div>
            <div><Label>Amount</Label><Input type="number" {...form.register("amount", { valueAsNumber: true })} className="mt-1" /></div>
            <div><Label>Period</Label><Select defaultValue="yearly" onValueChange={(v) => form.setValue("period", v as any)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>Start Date</Label><Input type="date" {...form.register("startDate")} className="mt-1" /></div><div><Label>End Date</Label><Input type="date" {...form.register("endDate")} className="mt-1" /></div></div>
            <DialogFooter><Button type="submit">{editingBudget ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
