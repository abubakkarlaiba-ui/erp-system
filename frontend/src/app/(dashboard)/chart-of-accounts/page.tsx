"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/layout/DataTable";
import { accountingApi, Account } from "@/features/accounting/api/accountingApi";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const accountSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

type AccountFormData = z.infer<typeof accountSchema>;

const typeConfig: Record<string, { label: string; color: string }> = {
  asset: { label: "Asset", color: "bg-blue-100 text-blue-800" },
  liability: { label: "Liability", color: "bg-red-100 text-red-800" },
  equity: { label: "Equity", color: "bg-purple-100 text-purple-800" },
  revenue: { label: "Revenue", color: "bg-green-100 text-green-800" },
  expense: { label: "Expense", color: "bg-orange-100 text-orange-800" },
};

function AccountTree({
  accounts,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  level = 0,
}: {
  accounts: Account[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  level?: number;
}) {
  return (
    <>
      {accounts.map((account) => (
        <div key={account.id}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 border-b hover:bg-muted/50 cursor-pointer",
              level > 0 && "border-l-2 border-l-muted"
            )}
            style={{ paddingLeft: `${(level + 1) * 1.5}rem` }}
          >
            {account.children && account.children.length > 0 ? (
              <button
                onClick={() => onToggle(account.id)}
                className="p-0.5 hover:bg-muted rounded"
              >
                {expanded.has(account.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <span className="font-mono text-sm text-muted-foreground w-20">
              {account.code}
            </span>
            <span className="flex-1 font-medium">{account.name}</span>
            <Badge
              variant="secondary"
              className={cn(typeConfig[account.type]?.color)}
            >
              {typeConfig[account.type]?.label}
            </Badge>
            <span className="w-32 text-right font-mono">
              {formatCurrency(account.balance)}
            </span>
            <Badge variant={account.isActive ? "default" : "secondary"}>
              {account.isActive ? "Active" : "Inactive"}
            </Badge>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(account)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(account.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
          <AnimatePresence>
            {expanded.has(account.id) && account.children && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AccountTree
                  accounts={account.children}
                  expanded={expanded}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  level={level + 1}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
}

export default function ChartOfAccountsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<AccountFormData>({
      resolver: zodResolver(accountSchema),
      defaultValues: { type: "asset", isActive: true, parentId: null },
    });

  const { data: accountsData, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => accountingApi.getAccounts({ perPage: 1000 }),
  });

  const createMutation = useMutation({
    mutationFn: accountingApi.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account created successfully");
      setDialogOpen(false);
      reset();
    },
    onError: () => toast.error("Failed to create account"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) =>
      accountingApi.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account updated successfully");
      setDialogOpen(false);
      setEditingAccount(null);
      reset();
    },
    onError: () => toast.error("Failed to update account"),
  });

  const deleteMutation = useMutation({
    mutationFn: accountingApi.deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account deleted successfully");
    },
    onError: () => toast.error("Failed to delete account"),
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setEditingAccount(null);
    reset({ code: "", name: "", type: "asset", parentId: null, isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (account: Account) => {
    setEditingAccount(account);
    reset({
      code: account.code,
      name: account.name,
      type: account.type,
      parentId: account.parentId,
      isActive: account.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: AccountFormData) => {
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  const accounts = accountsData?.data?.results ?? [];
  const flatAccounts = accounts.reduce<Account[]>((acc, a) => {
    acc.push(a);
    if (a.children) acc.push(...a.children);
    return acc;
  }, []);

  const filtered = accounts.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const grouped = {
    asset: filtered.filter((a) => a.type === "asset"),
    liability: filtered.filter((a) => a.type === "liability"),
    equity: filtered.filter((a) => a.type === "equity"),
    revenue: filtered.filter((a) => a.type === "revenue"),
    expense: filtered.filter((a) => a.type === "expense"),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts"
        action={{ label: "Add Account", icon: Plus, onClick: openCreate }}
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="asset">Assets</SelectItem>
            <SelectItem value="liability">Liabilities</SelectItem>
            <SelectItem value="equity">Equity</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border bg-card"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
          <span className="w-5" />
          <span className="w-20">Code</span>
          <span className="flex-1">Name</span>
          <span className="w-24">Type</span>
          <span className="w-32 text-right">Balance</span>
          <span className="w-20">Status</span>
          <span className="w-20">Actions</span>
        </div>

        {typeFilter === "all" ? (
          Object.entries(grouped).map(([type, items]) =>
            items.length > 0 ? (
              <div key={type}>
                <div className="px-4 py-2 bg-muted/20 border-b text-sm font-semibold flex items-center gap-2">
                  <Badge variant="secondary" className={cn(typeConfig[type]?.color)}>
                    {typeConfig[type]?.label}
                  </Badge>
                  <span className="text-muted-foreground">({items.length})</span>
                </div>
                <AccountTree
                  accounts={items}
                  expanded={expanded}
                  onToggle={toggleExpand}
                  onEdit={openEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              </div>
            ) : null
          )
        ) : (
          <AccountTree
            accounts={filtered}
            expanded={expanded}
            onToggle={toggleExpand}
            onEdit={openEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="px-4 py-12 text-center text-muted-foreground">
            No accounts found
          </div>
        )}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Edit Account" : "New Account"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input {...register("code")} placeholder="e.g. 1000" />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Account name" />
            </div>
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
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Parent Account</Label>
              <Select
                value={watch("parentId") ?? "none"}
                onValueChange={(v) =>
                  setValue("parentId", v === "none" ? null : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent</SelectItem>
                  {flatAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.code} - {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {editingAccount ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
