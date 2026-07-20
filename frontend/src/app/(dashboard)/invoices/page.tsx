"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Plus,
  Send,
  CheckCircle2,
  FileText,
  Download,
  Pencil,
  AlertCircle,
  DollarSign,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/layout/DataTable";
import StatsCard from "@/components/shared/StatsCard";
import {
  accountingApi,
  Invoice,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColumnDef } from "@tanstack/react-table";

const itemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
});

const invoiceSchema = z.object({
  type: z.enum(["sales", "purchase"]),
  customerId: z.string().min(1, "Customer is required"),
  date: z.string().min(1),
  dueDate: z.string().min(1),
  items: z.array(itemSchema).min(1, "At least one item"),
  tax: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("sales");

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ["invoices", activeTab, search],
    queryFn: () =>
      accountingApi.getInvoices({
        perPage: 100,
        search,
        type: activeTab as "sales" | "purchase",
      }),
  });

  const { data: accountsData } = useQuery({
    queryKey: ["accounts-list"],
    queryFn: () => accountingApi.getAccounts({ perPage: 1000 }),
  });

  const createMutation = useMutation({
    mutationFn: accountingApi.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created");
      setDialogOpen(false);
      reset();
    },
    onError: () => toast.error("Failed to create invoice"),
  });

  const sendMutation = useMutation({
    mutationFn: accountingApi.sendInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice sent");
    },
  });

  const payMutation = useMutation({
    mutationFn: accountingApi.markInvoicePaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice marked as paid");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      type: "sales",
      customerId: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      tax: 0,
      discount: 0,
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const tax = watch("tax") || 0;
  const discount = watch("discount") || 0;

  const subtotal = items.reduce(
    (s, i) => s + (i.quantity || 0) * (i.unitPrice || 0),
    0
  );
  const total = subtotal + tax - discount;

  const invoices = invoicesData?.data ?? [];
  const totalInvoices = invoices.length;
  const outstandingAmount = invoices
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .reduce((s, i) => s + i.total, 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;
  const paidThisMonth = invoices
    .filter(
      (i) =>
        i.status === "paid" &&
        new Date(i.date).getMonth() === new Date().getMonth()
    )
    .reduce((s, i) => s + i.total, 0);

  const accounts = accountsData?.data ?? [];

  const openCreate = () => {
    setEditingInvoice(null);
    reset({
      type: "sales",
      customerId: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      tax: 0,
      discount: 0,
      notes: "",
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: InvoiceFormData) => {
    const payload = {
      ...data,
      subtotal,
      total,
      customerName: "",
    };
    createMutation.mutate(payload as any);
  };

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: "invoiceNumber", header: "Invoice #" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    { accessorKey: "customerName", header: "Customer/Supplier" },
    {
      accessorKey: "total",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-mono">{formatCurrency(row.original.total)}</span>
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
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.original.dueDate),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="flex items-center gap-1">
            {inv.status === "draft" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => sendMutation.mutate(inv.id)}
              >
                <Send className="h-4 w-4 text-blue-600" />
              </Button>
            )}
            {(inv.status === "pending" || inv.status === "overdue") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => payMutation.mutate(inv.id)}
              >
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        action={{ label: "Create Invoice", icon: Plus, onClick: openCreate }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <StatsCard title="Total Invoices" value={totalInvoices} icon={FileText} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatsCard
            title="Outstanding Amount"
            value={formatCurrency(outstandingAmount)}
            icon={DollarSign}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatsCard title="Overdue" value={overdueCount} icon={AlertTriangle} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatsCard
            title="Paid This Month"
            value={formatCurrency(paidThisMonth)}
            icon={CheckCircle2}
          />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sales">Sales Invoices</TabsTrigger>
            <TabsTrigger value="purchase">Purchase Invoices</TabsTrigger>
          </TabsList>
          <TabsContent value="sales">
            <DataTable
              columns={columns}
              data={invoices}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="purchase">
            <DataTable
              columns={columns}
              data={invoices}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? "Edit Invoice" : "New Invoice"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(v) => setValue("type", v as "sales" | "purchase")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Invoice</SelectItem>
                    <SelectItem value="purchase">Purchase Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Customer/Supplier</Label>
                <Input {...register("customerId")} placeholder="Select..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...register("date")} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" {...register("dueDate")} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ description: "", quantity: 1, unitPrice: 0 })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 px-3 py-2 bg-muted/30 text-sm font-medium">
                  <span>Description</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Unit Price</span>
                  <span className="text-right">Total</span>
                  <span />
                </div>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 px-3 py-2 border-t items-center"
                  >
                    <Input
                      {...register(`items.${index}.description`)}
                      placeholder="Item description"
                    />
                    <Input
                      type="number"
                      {...register(`items.${index}.quantity`)}
                      className="text-right"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unitPrice`)}
                      className="text-right font-mono"
                    />
                    <span className="text-right font-mono text-sm">
                      {formatCurrency(
                        (items[index]?.quantity || 0) * (items[index]?.unitPrice || 0)
                      )}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                    >
                      <Pencil className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tax</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("tax")}
                  className="text-right font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("discount")}
                  className="text-right font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <div className="h-10 flex items-center font-mono text-lg font-semibold">
                  {formatCurrency(total)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea {...register("notes")} placeholder="Additional notes..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Invoice</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
