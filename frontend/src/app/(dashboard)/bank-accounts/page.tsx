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
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import {
  accountingApi,
  BankAccount,
} from "@/features/accounting/api/accountingApi";
import { cn, formatCurrency } from "@/lib/utils";
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
  accountType: z.enum(["savings", "current", "loan"]).default("current"),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

export default function BankAccountsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(
    null
  );

  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: accountingApi.getBankAccounts,
  });

  const createMutation = useMutation({
    mutationFn: accountingApi.createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      toast.success("Bank account added");
      setDialogOpen(false);
      reset();
    },
    onError: (e: any) => toast.error(e?.response?.data?.error?.message || e?.response?.data?.detail || "Failed to add bank account"),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: { name: "", accountNumber: "", bankName: "", currency: "USD", accountType: "current" },
  });

  const accounts = bankAccounts?.data ?? [];
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const onSubmit = (data: BankAccountFormData) => {
    createMutation.mutate(data as any);
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
          </div>

          <div className="border rounded-lg">
            <div className="px-4 py-8 text-center text-gray-500">
              Transaction history will be available once bank feeds are configured.
            </div>
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
                    <Building2 className="h-5 w-5 text-gray-500" />
                    {account.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">
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
            <div className="col-span-full py-12 text-center text-gray-500">
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
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select
                value={watch("accountType")}
                onValueChange={(v) => setValue("accountType", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                </SelectContent>
              </Select>
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
    </div>
  );
}
