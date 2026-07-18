'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, X, Mail, Phone, DollarSign, Users, TrendingUp, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/layout/DataTable';
import StatsCard from '@/components/shared/StatsCard';
import { salesApi } from '@/features/sales/api/salesApi';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Customer } from '@/types';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  company: z.string().optional(),
  address: z.string().optional(),
  balance: z.number().min(0).default(0),
  creditLimit: z.number().min(0).default(0),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', search, statusFilter],
    queryFn: () => salesApi.customers.get({ search, status: statusFilter !== 'all' ? statusFilter : undefined, limit: 50 }),
  });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', email: '', phone: '', company: '', address: '', balance: 0, creditLimit: 0, status: 'active' },
  });

  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) => salesApi.customers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created');
      setDialogOpen(false);
      form.reset();
    },
    onError: () => toast.error('Failed to create customer'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerFormData }) => salesApi.customers.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated');
      setDialogOpen(false);
      setEditingCustomer(null);
      form.reset();
    },
    onError: () => toast.error('Failed to update customer'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => salesApi.customers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Failed to delete customer'),
  });

  const customers = customersData?.data?.items ?? [];
  const totalCustomers = customersData?.data?.total ?? 0;
  const activeCustomers = customers.filter((c) => c.status === 'active').length;
  const newThisMonth = customers.filter((c) => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.balance ?? 0), 0);

  const openCreate = () => {
    setEditingCustomer(null);
    form.reset({ name: '', email: '', phone: '', company: '', address: '', balance: 0, creditLimit: 0, status: 'active' });
    setDialogOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company ?? '',
      address: customer.address ?? '',
      balance: customer.balance ?? 0,
      creditLimit: customer.creditLimit ?? 0,
      status: customer.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: CustomerFormData) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (c: Customer) => <span className="font-medium">{c.name}</span> },
    { key: 'email', header: 'Email', render: (c: Customer) => <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{c.email}</span> },
    { key: 'phone', header: 'Phone', render: (c: Customer) => <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{c.phone}</span> },
    { key: 'balance', header: 'Balance', render: (c: Customer) => formatCurrency(c.balance ?? 0) },
    { key: 'creditLimit', header: 'Credit Limit', render: (c: Customer) => formatCurrency(c.creditLimit ?? 0) },
    {
      key: 'status',
      header: 'Status',
      render: (c: Customer) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : c.status === 'inactive' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
          {c.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (c: Customer) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(c)} className="rounded-md p-1.5 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => setDeleteConfirm(c.id)} className="rounded-md p-1.5 hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Customers" action={{ label: 'Add Customer', onClick: openCreate, icon: Plus }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Customers" value={totalCustomers} icon={Users} trend={12} />
        <StatsCard title="Active" value={activeCustomers} icon={UserCheck} />
        <StatsCard title="New This Month" value={newThisMonth} icon={TrendingUp} trend={8} />
        <StatsCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} trend={5} />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customers..."
        filters={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        }
      />

      <AnimatePresence>
        {dialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
                <button onClick={() => { setDialogOpen(false); setEditingCustomer(null); }} className="rounded-md p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input {...form.register('name')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
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
                  <label className="text-sm font-medium">Company</label>
                  <input {...form.register('company')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
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
                    <label className="text-sm font-medium">Credit Limit</label>
                    <input {...form.register('creditLimit', { valueAsNumber: true })} type="number" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select {...form.register('status')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setDialogOpen(false); setEditingCustomer(null); }} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {editingCustomer ? 'Update' : 'Create'}
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
              <h2 className="text-lg font-semibold mb-2">Delete Customer</h2>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this customer? This action cannot be undone.</p>
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
