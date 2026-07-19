'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Pencil, ShoppingCart, Clock, Truck, CheckCircle2, XCircle, Package } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/layout/DataTable';
import StatsCard from '@/components/shared/StatsCard';
import { salesApi } from '@/features/sales/api/salesApi';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { SalesOrder } from '@/types';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Price must be positive'),
  tax: z.number().min(0).default(0),
});

const orderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  reference: z.string().optional(),
  orderDate: z.string().min(1, 'Order date is required'),
  expectedDelivery: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'At least one item is required'),
  discount: z.number().min(0).default(0),
});

type OrderFormData = z.infer<typeof orderSchema>;

const STATUS_PIPELINE = [
  { id: 'pending', label: 'Pending', color: 'bg-amber-500' },
  { id: 'processing', label: 'Processing', color: 'bg-blue-500' },
  { id: 'shipped', label: 'Shipped', color: 'bg-purple-500' },
  { id: 'delivered', label: 'Delivered', color: 'bg-emerald-500' },
  { id: 'completed', label: 'Completed', color: 'bg-green-600' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

export default function SalesOrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['sales-orders', search, statusFilter],
    queryFn: () => salesApi.orders.get({ search, status: statusFilter !== 'all' ? statusFilter : undefined, limit: 50 }),
  });

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { customerId: '', reference: '', orderDate: '', expectedDelivery: '', notes: '', items: [{ description: '', quantity: 1, unitPrice: 0, tax: 0 }], discount: 0 },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const createMutation = useMutation({
    mutationFn: (data: OrderFormData) => salesApi.orders.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales-orders'] }); toast.success('Order created'); setDialogOpen(false); form.reset(); },
    onError: () => toast.error('Failed to create order'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OrderFormData> }) => salesApi.orders.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales-orders'] }); toast.success('Order updated'); setDialogOpen(false); setEditingOrder(null); form.reset(); },
    onError: () => toast.error('Failed to update order'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => salesApi.orders.cancel(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales-orders'] }); toast.success('Order cancelled'); },
    onError: () => toast.error('Failed to cancel order'),
  });

  const orders = ordersData?.data?.results ?? [];
  const total = ordersData?.data?.count ?? 0;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  const openCreate = () => {
    setEditingOrder(null);
    form.reset({ customerId: '', reference: '', orderDate: '', expectedDelivery: '', notes: '', items: [{ description: '', quantity: 1, unitPrice: 0, tax: 0 }], discount: 0 });
    setDialogOpen(true);
  };

  const openEdit = (order: SalesOrder) => {
    setEditingOrder(order);
    form.reset({
      customerId: order.customerId ?? '',
      reference: order.reference ?? '',
      orderDate: order.orderDate ?? '',
      expectedDelivery: order.expectedDelivery ?? '',
      notes: order.notes ?? '',
      items: order.items?.length ? order.items : [{ description: '', quantity: 1, unitPrice: 0, tax: 0 }],
      discount: order.discount ?? 0,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: OrderFormData) => {
    if (editingOrder) {
      updateMutation.mutate({ id: editingOrder.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-emerald-100 text-emerald-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  const columns = [
    { key: 'reference', header: 'Order #', render: (o: SalesOrder) => <span className="font-medium">{o.reference ?? o.id.slice(0, 8)}</span> },
    { key: 'customer', header: 'Customer', render: (o: SalesOrder) => o.customerName ?? '-' },
    { key: 'date', header: 'Date', render: (o: SalesOrder) => formatDate(o.orderDate ?? o.createdAt) },
    { key: 'amount', header: 'Amount', render: (o: SalesOrder) => formatCurrency(o.total ?? 0) },
    { key: 'status', header: 'Status', render: (o: SalesOrder) => statusBadge(o.status) },
    {
      key: 'actions',
      header: '',
      render: (o: SalesOrder) => (
        <div className="flex items-center gap-1">
          {o.status === 'pending' && <button onClick={() => openEdit(o)} className="rounded-md p-1.5 hover:bg-muted"><Pencil className="h-4 w-4" /></button>}
          {(o.status === 'pending' || o.status === 'processing') && (
            <button onClick={() => cancelMutation.mutate(o.id)} className="rounded-md p-1.5 hover:bg-destructive/10 text-destructive"><XCircle className="h-4 w-4" /></button>
          )}
        </div>
      ),
    },
  ];

  const watchedItems = form.watch('items');
  const subtotal = watchedItems?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) ?? 0;
  const taxTotal = watchedItems?.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.tax / 100)), 0) ?? 0;
  const discount = form.watch('discount') ?? 0;
  const grandTotal = subtotal + taxTotal - discount;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Sales Orders" action={{ label: 'Create Order', onClick: openCreate, icon: Plus }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Orders" value={total} icon={ShoppingCart} />
        <StatsCard title="Pending" value={pendingCount} icon={Clock} />
        <StatsCard title="Processing" value={processingCount} icon={Truck} />
        <StatsCard title="Completed" value={completedCount} icon={CheckCircle2} />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STATUS_PIPELINE.filter((s) => s.id !== 'cancelled').map((stage, i) => {
            const count = orders.filter((o) => o.status === stage.id).length;
            return (
              <div key={stage.id} className="flex items-center">
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                  <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                  <span className="text-xs font-medium whitespace-nowrap">{stage.label}</span>
                  <span className="text-xs text-muted-foreground">({count})</span>
                </motion.div>
                {i < STATUS_PIPELINE.filter((s) => s.id !== 'cancelled').length - 1 && (
                  <div className="w-6 h-px bg-border mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search orders..."
        filters={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
            <option value="all">All Status</option>
            {STATUS_PIPELINE.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        }
      />

      <AnimatePresence>
        {dialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-2xl rounded-lg border bg-background p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editingOrder ? 'Edit Order' : 'Create Order'}</h2>
                <button onClick={() => { setDialogOpen(false); setEditingOrder(null); }} className="rounded-md p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Customer ID</label>
                    <input {...form.register('customerId')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    {form.formState.errors.customerId && <p className="text-xs text-destructive mt-1">{form.formState.errors.customerId.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reference</label>
                    <input {...form.register('reference')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Order Date</label>
                    <input {...form.register('orderDate')} type="date" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expected Delivery</label>
                    <input {...form.register('expectedDelivery')} type="date" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Line Items</label>
                    <button type="button" onClick={() => append({ description: '', quantity: 1, unitPrice: 0, tax: 0 })} className="text-sm text-primary hover:underline">+ Add Item</button>
                  </div>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <input {...form.register(`items.${index}.description`)} placeholder="Description" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                        </div>
                        <div className="col-span-2">
                          <input {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" placeholder="Qty" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                        </div>
                        <div className="col-span-2">
                          <input {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })} type="number" placeholder="Price" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                        </div>
                        <div className="col-span-2">
                          <input {...form.register(`items.${index}.tax`, { valueAsNumber: true })} type="number" placeholder="Tax %" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                        </div>
                        <div className="col-span-1">
                          {fields.length > 1 && <button type="button" onClick={() => remove(index)} className="rounded-md p-1.5 hover:bg-destructive/10 text-destructive"><X className="h-4 w-4" /></button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(taxTotal)}</span></div>
                  <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>
                  <div className="flex justify-between font-semibold text-base"><span>Total</span><span>{formatCurrency(grandTotal)}</span></div>
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea {...form.register('notes')} rows={2} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setDialogOpen(false); setEditingOrder(null); }} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {editingOrder ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
