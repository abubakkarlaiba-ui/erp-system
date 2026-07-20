"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Plus,
  ArrowRightLeft,
  ShoppingCart,
  TrendingDown,
  Package,
  ArrowLeftRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/layout/DataTable";
import StatsCard from "@/components/shared/StatsCard";
import {
  inventoryApi,
  StockMovement,
} from "@/features/inventory/api/inventoryApi";
import { cn, formatDate } from "@/lib/utils";
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

const transferSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  fromWarehouseId: z.string().min(1, "Source warehouse is required"),
  toWarehouseId: z.string().min(1, "Destination warehouse is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  notes: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

const typeConfig: Record<string, { label: string; color: string; icon: any }> = {
  purchase: {
    label: "Purchase",
    color: "bg-green-100 text-green-800",
    icon: ShoppingCart,
  },
  sale: {
    label: "Sale",
    color: "bg-blue-100 text-blue-800",
    icon: TrendingDown,
  },
  transfer: {
    label: "Transfer",
    color: "bg-purple-100 text-purple-800",
    icon: ArrowLeftRight,
  },
  adjustment: {
    label: "Adjustment",
    color: "bg-yellow-100 text-yellow-800",
    icon: Package,
  },
  return: {
    label: "Return",
    color: "bg-orange-100 text-orange-800",
    icon: ArrowRightLeft,
  },
};

export default function StockMovementsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: movementsData, isLoading } = useQuery({
    queryKey: ["stock-movements", search, typeFilter],
    queryFn: () =>
      inventoryApi.getStockMovements({
        page_size: 100,
        search: search || undefined,
        movement_type: typeFilter === "all" ? undefined : typeFilter,
      }),
  });

  const { data: productsData } = useQuery({
    queryKey: ["products-list"],
    queryFn: () => inventoryApi.getProducts({ page_size: 1000 }),
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: inventoryApi.getWarehouses,
  });

  const createMutation = useMutation({
    mutationFn: inventoryApi.createStockTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      toast.success("Stock transfer created");
      setDialogOpen(false);
      reset();
    },
    onError: () => toast.error("Failed to create transfer"),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      productId: "",
      fromWarehouseId: "",
      toWarehouseId: "",
      quantity: 1,
      notes: "",
    },
  });

  const movements = movementsData?.data ?? [];
  const products = productsData?.data ?? [];
  const warehouseList = warehouses?.data ?? [];

  const totalMovements = movementsData?.count ?? movements.length;
  const purchases = movements.filter((m) => m.type === "purchase").length;
  const sales = movements.filter((m) => m.type === "sale").length;
  const transfers = movements.filter((m) => m.type === "transfer").length;

  const onSubmit = (data: TransferFormData) => {
    createMutation.mutate(data);
  };

  const columns: ColumnDef<StockMovement>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    { accessorKey: "productName", header: "Product" },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const cfg = typeConfig[row.original.type];
        const Icon = cfg.icon;
        return (
          <Badge variant="secondary" className={cn(cfg.color)}>
            <Icon className="h-3 w-3 mr-1" />
            {cfg.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "fromWarehouse",
      header: "From",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.fromWarehouse || "-"}
        </span>
      ),
    },
    {
      accessorKey: "toWarehouse",
      header: "To",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.toWarehouse || "-"}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <span className="font-mono">{row.original.quantity}</span>
      ),
    },
    { accessorKey: "reference", header: "Reference" },
    { accessorKey: "createdBy", header: "Created By" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Movements"
        action={{
          label: "Transfer Stock",
          icon: Plus,
          onClick: () => setDialogOpen(true),
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatsCard
            title="Total Movements"
            value={totalMovements}
            icon={ArrowRightLeft}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <StatsCard title="Purchases" value={purchases} icon={ShoppingCart} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatsCard title="Sales" value={sales} icon={TrendingDown} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatsCard title="Transfers" value={transfers} icon={ArrowLeftRight} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
              <SelectItem value="return">Return</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable
          columns={columns}
          data={movements}
          searchValue={search}
          onSearchChange={setSearch}
          isLoading={isLoading}
        />
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select
                value={watch("productId")}
                onValueChange={(v) => setValue("productId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Warehouse</Label>
                <Select
                  value={watch("fromWarehouseId")}
                  onValueChange={(v) => setValue("fromWarehouseId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseList.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Warehouse</Label>
                <Select
                  value={watch("toWarehouseId")}
                  onValueChange={(v) => setValue("toWarehouseId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseList.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                {...register("quantity")}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea {...register("notes")} placeholder="Transfer notes..." />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Create Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
