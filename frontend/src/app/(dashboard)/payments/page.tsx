"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Plus,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/layout/DataTable";
import StatsCard from "@/components/shared/StatsCard";
import {
  accountingApi,
  Payment,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";

const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum(["cash", "bank_transfer", "check", "card"]),
  type: z.enum(["incoming", "outgoing"]),
  reference: z.string().min(1, "Reference is required"),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const methodLabels: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  check: "Check",
  card: "Card",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => accountingApi.getPayments({ perPage: 100, search }),
  });

  const createMutation = useMutation({
    mutationFn: accountingApi.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment recorded");
      setDialogOpen(false);
      reset();
    },
    onError: () => toast.error("Failed to record payment"),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: "",
      amount: 0,
      method: "cash",
      type: "incoming",
      reference: "",
      notes: "",
    },
  });

  const payments = paymentsData?.data?.data ?? [];
  const totalPayments = paymentsData?.data?.total ?? payments.length;
  const incomingAmount = payments
    .filter((p) => p.type === "incoming" && p.status === "completed")
    .reduce((s, p) => s + p.amount, 0);
  const outgoingAmount = payments
    .filter((p) => p.type === "outgoing" && p.status === "completed")
    .reduce((s, p) => s + p.amount, 0);
  const thisMonthPayments = payments.filter(
    (p) =>
      new Date(p.date).getMonth() === new Date().getMonth() &&
      new Date(p.date).getFullYear() === new Date().getFullYear()
  ).length;

  const onSubmit = (data: PaymentFormData) => {
    createMutation.mutate(data as any);
  };

  const columns: ColumnDef<Payment>[] = [
    { accessorKey: "paymentNumber", header: "Payment #" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    { accessorKey: "invoiceNumber", header: "Invoice" },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-mono">{formatCurrency(row.original.amount)}</span>
      ),
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => (
        <Badge variant="outline">
          {methodLabels[row.original.method] || row.original.method}
        </Badge>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={
            row.original.type === "incoming"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }
        >
          {row.original.type === "incoming" ? (
            <ArrowDownLeft className="h-3 w-3 mr-1" />
          ) : (
            <ArrowUpRight className="h-3 w-3 mr-1" />
          )}
          {row.original.type.charAt(0).toUpperCase() +
            row.original.type.slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={cn(statusColors[row.original.status])}
        >
          {row.original.status.charAt(0).toUpperCase() +
            row.original.status.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        action={{ label: "Record Payment", icon: Plus, onClick: () => setDialogOpen(true) }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <StatsCard title="Total Payments" value={totalPayments} icon={DollarSign} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatsCard
            title="Incoming"
            value={formatCurrency(incomingAmount)}
            icon={ArrowDownLeft}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatsCard
            title="Outgoing"
            value={formatCurrency(outgoingAmount)}
            icon={ArrowUpRight}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatsCard title="This Month" value={thisMonthPayments} icon={Clock} />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <DataTable
          columns={columns}
          data={payments}
          searchValue={search}
          onSearchChange={setSearch}
          isLoading={isLoading}
        />
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Invoice</Label>
              <Input {...register("invoiceId")} placeholder="Invoice ID" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("amount")}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select
                  value={watch("method")}
                  onValueChange={(v) => setValue("method", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(v) => setValue("type", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming">Incoming</SelectItem>
                    <SelectItem value="outgoing">Outgoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input {...register("reference")} placeholder="Reference number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea {...register("notes")} placeholder="Payment notes..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
