'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, X, Mail, Phone, DollarSign, Users, TrendingUp, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import { salesApi } from '@/features/sales/api/salesApi';
import { formatCurrency } from '@/lib/utils';
import type { Customer } from '@/types';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  company: z.string().optional(),
  address: z.string().optional(),
  balance: z.coerce.number().min(0).default(0),
  creditLimit: z.coerce.number().min(0).default(0),
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer created'); setDialogOpen(false); form.reset(); },
    onError: () => toast.error('Failed to create customer'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerFormData }) => salesApi.customers.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer updated'); setDialogOpen(false); setEditingCustomer(null); form.reset(); },
    onError: () => toast.error('Failed to update customer'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => salesApi.customers.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer deleted'); setDeleteConfirm(null); },
    onError: () => toast.error('Failed to delete customer'),
  });

  const customers = customersData?.data?.results ?? [];
  const totalCustomers = customersData?.data?.count ?? 0;
  const activeCustomers = customers.filter((c: any) => c.status === 'active').length;
  const newThisMonth = customers.filter((c: any) => {
    const d = new Date(c.created_at ?? c.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const totalRevenue = customers.reduce((sum: number, c: any) => sum + (c.balance ?? 0), 0);

  const openCreate = () => {
    setEditingCustomer(null);
    form.reset({ name: '', email: '', phone: '', company: '', address: '', balance: 0, creditLimit: 0, status: 'active' });
    setDialogOpen(true);
  };

  const openEdit = (customer: any) => {
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Customers" action={{ label: 'Add Customer', onClick: openCreate, icon: Plus }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Customers" value={totalCustomers} icon={Users} />
        <StatsCard title="Active" value={activeCustomers} icon={UserCheck} />
        <StatsCard title="New This Month" value={newThisMonth} icon={TrendingUp} />
        <StatsCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center gap-2 p-4 border-b">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Phone</th>
                <th className="p-4 font-medium text-right">Balance</th>
                <th className="p-4 font-medium text-right">Credit Limit</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4"><span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{c.email}</span></td>
                  <td className="p-4"><span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{c.phone}</span></td>
                  <td className="p-4 text-right">{formatCurrency(c.balance ?? 0)}</td>
                  <td className="p-4 text-right">{formatCurrency(c.creditLimit ?? 0)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : c.status === 'inactive' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="rounded-md p-1.5 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteConfirm(c.id)} className="rounded-md p-1.5 hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No customers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

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
                    <input {...form.register('balance')} type="number" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Credit Limit</label>
                    <input {...form.register('creditLimit')} type="number" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
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
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this customer?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                <button onClick={() => deleteMutation.mutate(deleteConfirm!)} disabled={deleteMutation.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
