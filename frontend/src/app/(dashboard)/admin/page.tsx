"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Building2, Shield, Trash2, Search,
  UserCheck, UserX, BarChart3, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import { adminApi, type AdminUser, type AdminCompany } from "@/features/admin/api/adminApi";
import { cn, formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  company_owner: "Company Owner",
  admin: "Admin",
  hr_manager: "HR Manager",
  hr_staff: "HR Staff",
  finance_manager: "Finance Manager",
  accountant: "Accountant",
  sales_manager: "Sales Manager",
  sales_staff: "Sales Staff",
  purchase_manager: "Purchase Manager",
  purchase_staff: "Purchase Staff",
  warehouse_manager: "Warehouse Manager",
  inventory_staff: "Inventory Staff",
  project_manager: "Project Manager",
  employee: "Employee",
  customer: "Customer",
  vendor: "Vendor",
  auditor: "Auditor",
  custom: "Custom",
};

type Tab = "overview" | "users" | "companies";

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [deleteCompany, setDeleteCompany] = useState<AdminCompany | null>(null);

  const isSuperAdmin = user?.is_superuser;

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error("Access denied. Super admin only.");
      router.push("/dashboard");
    }
  }, [isSuperAdmin, router]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getStats,
    enabled: !!isSuperAdmin,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users", searchQuery, roleFilter],
    queryFn: () => {
      const params: Record<string, unknown> = {};
      if (searchQuery) params.search = searchQuery;
      if (roleFilter !== "all") params.role = roleFilter;
      return adminApi.getUsers(params);
    },
    enabled: !!isSuperAdmin && tab === "users",
  });

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => adminApi.getCompanies(),
    enabled: !!isSuperAdmin && tab === "companies",
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      adminApi.updateUser(id, { is_active: !is_active } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User status updated");
    },
    onError: () => toast.error("Failed to update user"),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted");
      setDeleteUser(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "Failed to delete user");
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Company deleted");
      setDeleteCompany(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "Failed to delete company");
    },
  });

  if (!isSuperAdmin) return null;

  const users: AdminUser[] = usersData?.results ?? [];
  const companies: AdminCompany[] = companiesData?.results ?? [];

  const filteredUsers = users.filter((u) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!u.email.toLowerCase().includes(q) && !u.first_name?.toLowerCase().includes(q) && !u.last_name?.toLowerCase().includes(q)) return false;
    }
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { id: "companies", label: "Companies", icon: <Building2 className="h-4 w-4" /> },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <PageHeader title="Admin Panel" description="System administration" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" /> Super Admin
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-1 rounded-lg border bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id ? "bg-primary text-primary-foreground" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </motion.div>

      {tab === "overview" && (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Users" value={String(stats?.total_users ?? 0)} icon={<Users className="h-5 w-5" />} color="indigo" />
            <StatsCard title="Active Users" value={String(stats?.active_users ?? 0)} icon={<UserCheck className="h-5 w-5" />} color="emerald" />
            <StatsCard title="Total Companies" value={String(stats?.total_companies ?? 0)} icon={<Building2 className="h-5 w-5" />} color="amber" />
            <StatsCard title="Inactive Users" value={String((stats?.total_users ?? 0) - (stats?.active_users ?? 0))} icon={<UserX className="h-5 w-5" />} color="rose" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold">Users by Role</h3>
              {stats?.users_by_role?.map((r) => (
                <div key={r.role} className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">{ROLE_LABELS[r.role] || r.role}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${stats.total_users > 0 ? (r.count / stats.total_users) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{r.count}</span>
                  </div>
                </div>
              ))}
              {(!stats?.users_by_role || stats.users_by_role.length === 0) && (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </div>

            <div className="rounded-xl border bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold">Users by Company</h3>
              {stats?.users_by_company?.map((c) => (
                <div key={c.company_name} className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">{c.company_name}</span>
                  <span className="text-sm font-medium">{c.count}</span>
                </div>
              ))}
              {(!stats?.users_by_company || stats.users_by_company.length === 0) && (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {tab === "users" && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Company</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Joined</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Loading...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No users found</td></tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium">{u.first_name} {u.last_name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                            u.role === "super_admin" ? "bg-purple-100 text-purple-700" :
                            u.role === "admin" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          )}>
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">{(u.company as any)?.name || "-"}</td>
                        <td className="p-4">
                          <span className={cn(
                            "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                            u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          )}>
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => toggleActiveMutation.mutate({ id: u.id, is_active: u.is_active })}
                              className={cn("rounded p-1", u.is_active ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50")}
                              title={u.is_active ? "Deactivate" : "Activate"}
                            >
                              {u.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                            </button>
                            {!u.is_superuser && (
                              <button
                                onClick={() => setDeleteUser(u)}
                                className="rounded p-1 text-red-500 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {tab === "companies" && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="rounded-xl border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="p-4 font-medium">Company</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">Location</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companiesLoading ? (
                    <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Loading...</td></tr>
                  ) : companies.length === 0 ? (
                    <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No companies found</td></tr>
                  ) : (
                    companies.map((c) => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-4 font-medium">{c.name}</td>
                        <td className="p-4 text-gray-500">{c.email || "-"}</td>
                        <td className="p-4 text-gray-500">{c.phone || "-"}</td>
                        <td className="p-4 text-gray-500">{[c.city, c.country].filter(Boolean).join(", ") || "-"}</td>
                        <td className="p-4">
                          <span className={cn(
                            "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                            c.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          )}>
                            {c.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setDeleteCompany(c)}
                            className="rounded p-1 text-red-500 hover:bg-red-50"
                            title="Delete"
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
          </div>
        </motion.div>
      )}

      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteUser?.email}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteUser && deleteUserMutation.mutate(deleteUser.id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteCompany} onOpenChange={() => setDeleteCompany(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Company</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteCompany?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCompany(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteCompany && deleteCompanyMutation.mutate(deleteCompany.id)}
              disabled={deleteCompanyMutation.isPending}
            >
              {deleteCompanyMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
