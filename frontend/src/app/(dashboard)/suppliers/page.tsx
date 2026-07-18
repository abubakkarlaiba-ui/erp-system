'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Mail, Phone, Building2, DollarSign, Users, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/layout/DataTable';
import StatsCard from '@/components/shared/StatsCard';
import { purchaseApi } from '@/features/purchase/api/purchaseApi';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Supplier } from '@/types';

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
  balance: z.number().min(0).default(0),
  paymentTerms: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ['suppliers', search, statusFilter],
    queryFn: () => purchaseApi.suppliers.get({ search, status: statusFilter !== 'all' ? statusFilter : undefined, limit: 50 }),
  });

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: '', contactPerson: '', email: '', phone: '', address: '', balance: 0, paymentTerms: '', status: 'active' },
  });

  const createMutation = useMutation({
    mutationFn: (data: SupplierFormData) => purchaseApi.suppliers.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Supplier created'); setDialogOpen(false); form.reset(); },
    onError: () => toast.error('Failed to create supplier'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierFormData }) => purchaseApi.suppliers.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Supplier updated'); setDialogOpen(false); setEditingSupplier(null); form.reset(); },
    onError: () => toast.error('Failed to update supplier'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => purchaseApi.suppliers.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Supplier deleted'); setDeleteConfirm(null); },
    onError: () => toast.error('Failed to delete supplier'),
  });

  const suppliers = suppliersData?.data?.items ?? [];
  const total = suppliersData?.data?.total ?? 0;
  const activeCount = suppliers.filter((s) => s.status === 'active').length;
  const pendingBills = suppliers.filter((s) => (s.balance ?? 0) > 0).length;
  const totalPurchases = suppliers.reduce((sum, s) => sum + (s.balance ?? 0), 0);

  const openCreate = () => {
    setEditingSupplier(null);
    form.reset({ name: '', contactPerson: '', email: '', phone: '', address: '', balance: 0, paymentTerms: '', status: 'active' });
    setDialogOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.reset({
      name: supplier.name,
      contactPerson: supplier.contactPerson ?? '',
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address ?? '',
      balance: supplier.balance ?? 0,
      paymentTerms: supplier.paymentTerms ?? '',
      status: supplier.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: SupplierFormData) => {
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (s: Supplier) => <span className="font-medium">{s.name}</span> },
    { key: 'contactPerson', header: 'Contact Person', render: (s: Supplier) => s.contactPerson ?? '-' },
    { key: 'email', header: 'Email', render: (s: Supplier) => <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{s.email}</span> },
    { key: 'phone', header: 'Phone', render: (s: Supplier) => <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{s.phone}</span> },
    { key: 'balance', header: 'Balance', render: (s: Supplier) => formatCurrency(s.balance ?? 0) },
    {
      key: 'status',
      header: 'Status',
      render: (s: Supplier) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : s.status === 'inactive' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-700'}`}>
          {s.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (s: Supplier) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(s)} className="rounded-md p-1.5 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => setDeleteConfirm(s.id)} className="rounded-md p-1.5 hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Suppliers" action={{ label: 'Add Supplier', onClick: openCreate, icon: Plus }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Suppliers" value={total} icon={Users} trend={5} />
        <StatsCard title="Active" value={activeCount} icon={Users} />
        <StatsCard title="Pending Bills" value={pendingBills} icon={AlertCircle} />
        <StatsCard title="Total Purchases" value={formatCurrency(totalPurchases)} icon={DollarSign} trend={8} />
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search suppliers..."
        filters={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        }
      />

      <AnimatePresence>
        {dialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
                <button onClick={() => { setDialogOpen(false); setEditingSupplier(null); }} className="rounded-md p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input {...form.register('name')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Person</label>
                  <input {...form.register('contactPerson')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  {form.formState.errors.contactPerson && <p className="text-xs text-destructive mt-1">{form.formState.errors.contactPerson.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input {...form.register('email')} type="email" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    {form.formState.errors.email && <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <input {...form.register('phone')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <input {...form.register('address')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Balance</label>
                    <input {...form.register('balance', { valueAsNumber: true })} type="number" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Payment Terms</label>
                    <input {...form.register('paymentTerms')} placeholder="e.g. Net 30" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select {...form.register('status')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setDialogOpen(false); setEditingSupplier(null); }} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {editingSupplier ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg mx-4">
              <h2 className="text-lg font-semibold mb-2">Delete Supplier</h2>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this supplier? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                <button onClick={() => deleteMutation.mutate(deleteConfirm)} disabled={deleteMutation.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
