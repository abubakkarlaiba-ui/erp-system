"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Monitor, DollarSign, TrendingDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import { accountingApi, type FixedAsset } from "@/features/accounting/api/accountingApi";
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

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  maintenance: "bg-amber-100 text-amber-700",
  disposed: "bg-red-100 text-red-700",
};

const DEPRECIATION_METHODS = [
  { value: "straight_line", label: "Straight Line" },
  { value: "declining_balance", label: "Declining Balance" },
  { value: "units_of_production", label: "Units of Production" },
];

export default function FixedAssetsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [category, setCategory] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [depreciationMethod, setDepreciationMethod] = useState("straight_line");
  const [usefulLifeYears, setUsefulLifeYears] = useState("5");
  const [status, setStatus] = useState("active");
  const [location, setLocation] = useState("");

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["fixedAssets"],
    queryFn: async () => {
      const res = await accountingApi.getFixedAssets();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      accountingApi.createFixedAsset({
        name,
        assetCode,
        category,
        purchaseDate,
        purchaseValue: Number(purchaseValue),
        currentValue: Number(currentValue || purchaseValue),
        depreciationMethod,
        usefulLifeYears: Number(usefulLifeYears),
        status,
        location,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixedAssets"] });
      toast.success("Asset added successfully");
      resetForm();
      setDialogOpen(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Failed to add asset";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountingApi.deleteFixedAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixedAssets"] });
      toast.success("Asset deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete asset"),
  });

  const resetForm = () => {
    setName("");
    setAssetCode("");
    setCategory("");
    setPurchaseDate("");
    setPurchaseValue("");
    setCurrentValue("");
    setDepreciationMethod("straight_line");
    setUsefulLifeYears("5");
    setStatus("active");
    setLocation("");
  };

  const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalDepreciation = assets.reduce((s, a) => s + a.accumulatedDepreciation, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <PageHeader title="Fixed Assets" />
        <button
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Asset
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Assets" value={String(assets.length)} icon={<Monitor className="h-5 w-5" />} color="indigo" />
        <StatsCard title="Total Value" value={formatCurrency(totalValue)} icon={<DollarSign className="h-5 w-5" />} color="emerald" />
        <StatsCard title="Depreciation" value={formatCurrency(totalDepreciation)} icon={<TrendingDown className="h-5 w-5" />} color="amber" />
        <StatsCard title="In Maintenance" value={String(assets.filter((a) => a.status === "maintenance").length)} icon={<AlertTriangle className="h-5 w-5" />} color="rose" />
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="p-4 font-medium">Asset</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Purchase Date</th>
                <th className="p-4 font-medium text-right">Purchase Value</th>
                <th className="p-4 font-medium text-right">Current Value</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">Loading assets...</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">No assets found. Add your first asset.</td></tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-xs text-gray-400">{asset.assetCode}</div>
                    </td>
                    <td className="p-4 text-gray-500">{asset.category}</td>
                    <td className="p-4 text-gray-500">{asset.purchaseDate}</td>
                    <td className="p-4 text-right">{formatCurrency(asset.purchaseValue)}</td>
                    <td className="p-4 text-right">{formatCurrency(asset.currentValue)}</td>
                    <td className="p-4">
                      <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-medium", STATUS_BADGE[asset.status] || "")}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{asset.location || "-"}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setDeleteId(asset.id)}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" placeholder="e.g. MacBook Pro" />
              </div>
              <div>
                <Label>Asset Code</Label>
                <Input value={assetCode} onChange={(e) => setAssetCode(e.target.value)} className="mt-1" placeholder="e.g. LAP-001" />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1" placeholder="e.g. Laptops" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Purchase Date</Label>
                <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Purchase Value</Label>
                <Input type="number" value={purchaseValue} onChange={(e) => setPurchaseValue(e.target.value)} className="mt-1" placeholder="0.00" />
              </div>
              <div>
                <Label>Current Value</Label>
                <Input type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} className="mt-1" placeholder="Same as purchase value if not set" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Depreciation Method</Label>
                <Select value={depreciationMethod} onValueChange={setDepreciationMethod}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEPRECIATION_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Useful Life (Years)</Label>
                <Input type="number" value={usefulLifeYears} onChange={(e) => setUsefulLifeYears(e.target.value)} className="mt-1" min="1" />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1" placeholder="e.g. Office A" />
            </div>
            <DialogFooter>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!name || !assetCode || !category || !purchaseDate || !purchaseValue || createMutation.isPending}
              >
                {createMutation.isPending ? "Adding..." : "Add Asset"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this asset?</p>
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
