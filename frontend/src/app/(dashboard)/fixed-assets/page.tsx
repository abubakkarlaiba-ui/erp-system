"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Monitor, DollarSign, Calendar, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  category: z.string().min(1, "Category is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchasePrice: z.number().min(0, "Price must be positive"),
  currentValue: z.number().min(0, "Value must be positive"),
  status: z.enum(["active", "maintenance", "retired"]),
  location: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const sampleAssets = [
  { id: "1", name: "MacBook Pro 16\"", category: "Laptops", purchaseDate: "2024-01-15", purchasePrice: 2500, currentValue: 2000, status: "active", location: "Office A" },
  { id: "2", name: "Dell UltraSharp 27\" Monitor", category: "Monitors", purchaseDate: "2024-03-10", purchasePrice: 600, currentValue: 480, status: "active", location: "Office A" },
  { id: "3", name: "Standing Desk Pro", category: "Furniture", purchaseDate: "2023-09-01", purchasePrice: 800, currentValue: 600, status: "active", location: "Office B" },
  { id: "4", name: "HP LaserJet Printer", category: "Printers", purchaseDate: "2023-06-15", purchasePrice: 450, currentValue: 270, status: "maintenance", location: "Admin" },
  { id: "5", name: "Conference Room Projector", category: "AV Equipment", purchaseDate: "2024-02-20", purchasePrice: 1200, currentValue: 960, status: "active", location: "Conference Room" },
  { id: "6", name: "Server Rack", category: "IT Infrastructure", purchaseDate: "2023-01-10", purchasePrice: 5000, currentValue: 3000, status: "active", location: "Server Room" },
];

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  maintenance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  retired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function FixedAssetsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { name: "", category: "", purchaseDate: "", purchasePrice: 0, currentValue: 0, status: "active", location: "" },
  });

  const totalValue = sampleAssets.reduce((s, a) => s + a.currentValue, 0);
  const totalDepreciation = sampleAssets.reduce((s, a) => s + (a.purchasePrice - a.currentValue), 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <PageHeader title="Fixed Assets" />
        <button onClick={() => { setEditingAsset(null); form.reset(); setDialogOpen(true); }} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Asset
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Assets" value={String(sampleAssets.length)} icon={<Monitor className="h-5 w-5" />} color="indigo" />
        <StatsCard title="Total Value" value={`$${totalValue.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} color="emerald" />
        <StatsCard title="Depreciation" value={`$${totalDepreciation.toLocaleString()}`} icon={<TrendingDown className="h-5 w-5" />} color="amber" />
        <StatsCard title="In Maintenance" value={String(sampleAssets.filter((a) => a.status === "maintenance").length)} icon={<Calendar className="h-5 w-5" />} color="rose" />
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-4 font-medium">Asset</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Purchase Date</th>
                <th className="p-4 font-medium text-right">Purchase Price</th>
                <th className="p-4 font-medium text-right">Current Value</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sampleAssets.map((asset) => (
                <tr key={asset.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-4 font-medium">{asset.name}</td>
                  <td className="p-4 text-muted-foreground">{asset.category}</td>
                  <td className="p-4 text-muted-foreground">{asset.purchaseDate}</td>
                  <td className="p-4 text-right">{formatCurrency(asset.purchasePrice)}</td>
                  <td className="p-4 text-right">{formatCurrency(asset.currentValue)}</td>
                  <td className="p-4"><span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-medium", STATUS_BADGE[asset.status])}>{asset.status}</span></td>
                  <td className="p-4 text-muted-foreground">{asset.location}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => { setEditingAsset(asset); form.reset(asset); setDialogOpen(true); }} className="rounded p-1 hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingAsset ? "Edit Asset" : "Add Asset"}</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit((d) => { toast.success(editingAsset ? "Asset updated" : "Asset added"); setDialogOpen(false); })} className="space-y-4">
            <div><Label>Name</Label><Input {...form.register("name")} className="mt-1" /></div>
            <div><Label>Category</Label><Input {...form.register("category")} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Purchase Date</Label><Input type="date" {...form.register("purchaseDate")} className="mt-1" /></div>
              <div><Label>Status</Label><Select defaultValue="active" onValueChange={(v) => form.setValue("status", v as any)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="retired">Retired</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Purchase Price</Label><Input type="number" {...form.register("purchasePrice", { valueAsNumber: true })} className="mt-1" /></div>
              <div><Label>Current Value</Label><Input type="number" {...form.register("currentValue", { valueAsNumber: true })} className="mt-1" /></div>
            </div>
            <div><Label>Location</Label><Input {...form.register("location")} className="mt-1" /></div>
            <DialogFooter><Button type="submit">{editingAsset ? "Update" : "Add"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
