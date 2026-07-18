"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Warehouse,
  MapPin,
  Users,
  Package,
  Pencil,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import {
  inventoryApi,
  Warehouse as WarehouseType,
  StockItem,
} from "@/features/inventory/api/inventoryApi";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const warehouseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  manager: z.string().min(1, "Manager is required"),
  phone: z.string().optional(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

export default function WarehousesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] =
    useState<WarehouseType | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseType | null>(null);

  const { data: warehousesData, isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: inventoryApi.getWarehouses,
  });

  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ["warehouse-stock", selectedWarehouse?.id],
    queryFn: () =>
      inventoryApi.getStock({
        perPage: 100,
        warehouseId: selectedWarehouse!.id,
      }),
    enabled: !!selectedWarehouse,
  });

  const createMutation = useMutation({
    mutationFn: inventoryApi.createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse created");
      setDialogOpen(false);
      reset();
    },
    onError: () => toast.error("Failed to create warehouse"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WarehouseType> }) =>
      inventoryApi.updateWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse updated");
      setDialogOpen(false);
      setEditingWarehouse(null);
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: { name: "", code: "", address: "", city: "", manager: "", phone: "" },
  });

  const warehouses = warehousesData?.data ?? [];
  const stock = stockData?.data?.data ?? [];
  const totalStock = warehouses.reduce((s, w) => s + w.totalStock, 0);

  const openCreate = () => {
    setEditingWarehouse(null);
    reset({ name: "", code: "", address: "", city: "", manager: "", phone: "" });
    setDialogOpen(true);
  };

  const openEdit = (wh: WarehouseType) => {
    setEditingWarehouse(wh);
    reset({
      name: wh.name,
      code: wh.code,
      address: wh.address,
      city: wh.city,
      manager: wh.manager,
      phone: wh.phone,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: WarehouseFormData) => {
    if (editingWarehouse) {
      updateMutation.mutate({ id: editingWarehouse.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        action={{ label: "Add Warehouse", icon: Plus, onClick: openCreate }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <StatsCard
            title="Total Warehouses"
            value={warehouses.length}
            icon={Warehouse}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatsCard title="Total Stock" value={totalStock} icon={Package} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatsCard
            title="Active Warehouses"
            value={warehouses.filter((w) => w.isActive).length}
            icon={MapPin}
          />
        </motion.div>
      </div>

      {selectedWarehouse ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setSelectedWarehouse(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h2 className="text-xl font-semibold">{selectedWarehouse.name}</h2>
            <Badge variant="secondary">{selectedWarehouse.code}</Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {selectedWarehouse.address}, {selectedWarehouse.city}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Manager: {selectedWarehouse.manager}
            </div>
            <div className="text-muted-foreground">
              Phone: {selectedWarehouse.phone || "N/A"}
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="grid grid-cols-[1fr_80px_80px_100px_100px] gap-2 px-4 py-2.5 bg-muted/30 text-sm font-medium">
              <span>Product</span>
              <span className="text-right">Stock</span>
              <span className="text-right">Reserved</span>
              <span className="text-right">Available</span>
              <span>SKU</span>
            </div>
            {stock.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_80px_80px_100px_100px] gap-2 px-4 py-2.5 border-t text-sm"
              >
                <span>{item.productName}</span>
                <span className="text-right font-mono">{item.quantity}</span>
                <span className="text-right font-mono">
                  {item.reservedQuantity}
                </span>
                <span className="text-right font-mono">
                  {item.availableQuantity}
                </span>
                <span className="text-muted-foreground">{item.sku}</span>
              </div>
            ))}
            {stock.length === 0 && !stockLoading && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No stock items
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {warehouses.map((wh, index) => (
              <motion.div
                key={wh.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Warehouse className="h-5 w-5 text-muted-foreground" />
                      {wh.name}
                      <Badge variant="secondary" className="ml-auto">
                        {wh.code}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {wh.address}, {wh.city}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {wh.manager}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <span className="text-2xl font-semibold font-mono">
                          {wh.totalStock}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          items
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWarehouse(wh)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(wh)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {warehouses.length === 0 && !isLoading && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No warehouses found
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWarehouse ? "Edit Warehouse" : "New Warehouse"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...register("name")} placeholder="Warehouse name" />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input {...register("code")} placeholder="e.g. WH-001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input {...register("address")} placeholder="Street address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input {...register("city")} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label>Manager</Label>
                <Input {...register("manager")} placeholder="Manager name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register("phone")} placeholder="Phone number" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingWarehouse ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
