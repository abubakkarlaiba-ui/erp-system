"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Building2,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import {
  accountingApi,
  BankAccount,
  BankTransaction,
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const bankAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  currency: z.string().min(3, "Currency is required"),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

export default function BankAccountsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(
    null
  );
  const [reconcileDialog, setReconcileDialog] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(
    new Set()
  );

  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: accountingApi.getBankAccounts,
  });

  const { data: transactionsData, isLoading: txLoading } = useQuery({
    queryKey: ["bank-transactions", selectedAccount?.id],
    queryFn: () =>
      accountingApi.getBankTransactions(selectedAccount!.id, { perPage: 100 }),
    enabled: !!selectedAccount,
  });

  const createMutation = useMutation({
    mutationFn: accountingApi.createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      toast.success("Bank account added");
      setDialogOpen(false);
      reset();
    },
    onError: () => toast.error("Failed to add bank account"),
  });

  const reconcileMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { transactionIds: string[] } }) =>
      accountingApi.reconcileBank(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      toast.success("Reconciliation complete");
      setReconcileDialog(false);
      setSelectedTransactions(new Set());
    },
  });

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: { name: "", accountNumber: "", bankName: "", currency: "USD" },
  });

  const accounts = bankAccounts?.data?.results ?? [];
  const transactions = transactionsData?.data?.results ?? [];
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const onSubmit = (data: BankAccountFormData) => {
    createMutation.mutate(data as any);
  };

  const toggleTransactionSelection = (id: string) => {
    setSelectedTransactions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Accounts"
        action={{
          label: "Add Account",
          icon: Plus,
          onClick: () => setDialogOpen(true),
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatsCard
            title="Total Accounts"
            value={accounts.length}
            icon={Building2}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <StatsCard
            title="Total Balance"
            value={formatCurrency(totalBalance)}
            icon={CreditCard}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatsCard
            title="Active Accounts"
            value={accounts.filter((a) => a.isActive).length}
            icon={CheckCircle2}
          />
        </motion.div>
      </div>

      {selectedAccount ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedAccount(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h2 className="text-xl font-semibold">{selectedAccount.name}</h2>
            <Badge variant="secondary">
              {formatCurrency(selectedAccount.balance)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReconcileDialog(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reconcile
            </Button>
          </div>

          <div className="border rounded-lg">
            <div className="grid grid-cols-[120px_1fr_100px_100px_100px_100px] gap-2 px-4 py-2.5 bg-muted/30 text-sm font-medium">
              <span>Date</span>
              <span>Description</span>
              <span className="text-right">Debit</span>
              <span className="text-right">Credit</span>
              <span className="text-right">Balance</span>
              <span className="text-center">Reconciled</span>
            </div>
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className={cn(
                  "grid grid-cols-[120px_1fr_100px_100px_100px_100px] gap-2 px-4 py-2.5 border-t text-sm cursor-pointer hover:bg-muted/50",
                  selectedTransactions.has(tx.id) && "bg-blue-50"
                )}
                onClick={() => toggleTransactionSelection(tx.id)}
              >
                <span className="text-muted-foreground">
                  {formatDate(tx.date)}
                </span>
                <span>{tx.description}</span>
                <span className="text-right font-mono">
                  {tx.debit > 0 ? formatCurrency(tx.debit) : "-"}
                </span>
                <span className="text-right font-mono">
                  {tx.credit > 0 ? formatCurrency(tx.credit) : "-"}
                </span>
                <span className="text-right font-mono">
                  {formatCurrency(tx.balance)}
                </span>
                <span className="text-center">
                  {tx.reconciled ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </span>
              </div>
            ))}
            {transactions.length === 0 && !txLoading && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No transactions
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedAccount(account)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    {account.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {account.bankName} - {account.accountNumber}
                    </p>
                    <p className="text-2xl font-semibold font-mono">
                      {formatCurrency(account.balance)}
                    </p>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.currency}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {accounts.length === 0 && !isLoading && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No bank accounts found
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input {...register("name")} placeholder="e.g. Main Business Account" />
            </div>
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input {...register("bankName")} placeholder="e.g. Chase Bank" />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input {...register("accountNumber")} placeholder="Account number" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input {...register("currency")} placeholder="USD" defaultValue="USD" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={reconcileDialog} onOpenChange={setReconcileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reconcile Transactions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select unreconciled transactions to reconcile. Selected:{" "}
              {selectedTransactions.size}
            </p>
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              {transactions
                .filter((tx) => !tx.reconciled)
                .map((tx) => (
                  <div
                    key={tx.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 border-b cursor-pointer hover:bg-muted/50",
                      selectedTransactions.has(tx.id) && "bg-blue-50"
                    )}
                    onClick={() => toggleTransactionSelection(tx.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTransactions.has(tx.id)}
                      onChange={() => toggleTransactionSelection(tx.id)}
                      className="h-4 w-4"
                    />
                    <span className="flex-1 text-sm">{tx.description}</span>
                    <span className="font-mono text-sm">
                      {formatCurrency(tx.debit || tx.credit)}
                    </span>
                  </div>
                ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReconcileDialog(false)}>
                Cancel
              </Button>
              <Button
                disabled={selectedTransactions.size === 0}
                onClick={() =>
                  reconcileMutation.mutate({
                    id: selectedAccount!.id,
                    data: { transactionIds: Array.from(selectedTransactions) },
                  })
                }
              >
                Reconcile Selected
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
