'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Send, Check, XCircle, Pencil, Eye, FileText, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/layout/DataTable';
import StatsCard from '@/components/shared/StatsCard';
import { salesApi } from '@/features/sales/api/salesApi';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Quotation, QuotationItem } from '@/types';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Price must be positive'),
  tax: z.number().min(0).default(0),
});

const quotationSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  reference: z.string().optional(),
  validUntil: z.string().min(1, 'Valid until is required'),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'At least one item is required'),
  discount: z.number().min(0).default(0),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

export default function QuotationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);

  const { data: quotationsData, isLoading } = useQuery({
    queryKey: ['quotations', search, statusFilter],
    queryFn: () => salesApi.quotations.get({ search, status: statusFilter !== 'all' ? statusFilter : undefined, limit: 50 }),
  });

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: { customerId: '', reference: '', validUntil: '', notes: '', items: [{ description: '', quantity: 1, unitPrice: 0, tax: 0 }], discount: 0 },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const createMutation = useMutation({
    mutationFn: (data: QuotationFormData) => salesApi.quotations.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quotations'] }); toast.success('Quotation created'); setDialogOpen(false); form.reset(); },
    onError: () => toast.error('Failed to create quotation'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QuotationFormData> }) => salesApi.quotations.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quotations'] }); toast.success('Quotation updated'); setDialogOpen(false); setEditingQuotation(null); form.reset(); },
    onError: () => toast.error('Failed to update quotation'),
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => salesApi.quotations.send(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quotations'] }); toast.success('Quotation sent'); },
    onError: () => toast.error('Failed to send quotation'),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => salesApi.quotations.accept(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quotations'] }); toast.success('Quotation accepted'); },
    onError: () => toast.error('Failed to accept quotation'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => salesApi.quotations.reject(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quotations'] }); toast.success('Quotation rejected'); },
    onError: () => toast.error('Failed to reject quotation'),
  });

  const quotations = quotationsData?.data?.items ?? [];
  const total = quotationsData?.data?.total ?? 0;
  const draftCount = quotations.filter((q) => q.status === 'draft').length;
  const sentCount = quotations.filter((q) => q.status === 'sent').length;
  const acceptedCount = quotations.filter((q) => q.status === 'accepted').length;

  const openCreate = () => {
    setEditingQuotation(null);
    form.reset({ customerId: '', reference: '', validUntil: '', notes: '', items: [{ description: '', quantity: 1, unitPrice: 0, tax: 0 }], discount: 0 });
    setDialogOpen(true);
  };

  const openEdit = (q: Quotation) => {
    setEditingQuotation(q);
    form.reset({
      customerId: q.customerId ?? '',
      reference: q.reference ?? '',
      validUntil: q.validUntil ?? '',
      notes: q.notes ?? '',
      items: q.items?.length ? q.items : [{ description: '', quantity: 1, unitPrice: 0, tax: 0 }],
      discount: q.discount ?? 0,
    });
    setDialogOpen(true);
  };

  const openView = (q: Quotation) => {
    setViewingQuotation(q);
    setViewDialogOpen(true);
  };

  const onSubmit = (data: QuotationFormData) => {
    if (editingQuotation) {
      updateMutation.mutate({ id: editingQuotation.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      accepted: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
      expired: 'bg-amber-100 text-amber-700',
    };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  const columns = [
    { key: 'reference', header: 'Quotation #', render: (q: Quotation) => <span className="font-medium">{q.reference ?? q.id.slice(0, 8)}</span> },
    { key: 'customer', header: 'Customer', render: (q: Quotation) => q.customerName ?? '-' },
    { key: 'date', header: 'Date', render: (q: Quotation) => formatDate(q.createdAt) },
    { key: 'validUntil', header: 'Valid Until', render: (q: Quotation) => q.validUntil ? formatDate(q.validUntil) : '-' },
    { key: 'amount', header: 'Amount', render: (q: Quotation) => formatCurrency(q.total ?? 0) },
    { key: 'status', header: 'Status', render: (q: Quotation) => statusBadge(q.status) },
    {
      key: 'actions',
      header: '',
      render: (q: Quotation) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openView(q)} className="rounded-md p-1.5 hover:bg-muted"><Eye className="h-4 w-4" /></button>
          {q.status === 'draft' && <button onClick={() => openEdit(q)} className="rounded-md p-1.5 hover:bg-muted"><Pencil className="h-4 w-4" /></button>}
          {q.status === 'draft' && <button onClick={() => sendMutation.mutate(q.id)} className="rounded-md p-1.5 hover:bg-blue-100 text-blue-600"><Send className="h-4 w-4" /></button>}
          {q.status === 'sent' && <button onClick={() => acceptMutation.mutate(q.id)} className="rounded-md p-1.5 hover:bg-emerald-100 text-emerald-600"><Check className="h-4 w-4" /></button>}
          {q.status === 'sent' && <button onClick={() => rejectMutation.mutate(q.id)} className="rounded-md p-1.5 hover:bg-red-100 text-red-600"><XCircle className="h-4 w-4" /></button>}
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
      <PageHeader title="Quotations" action={{ label: 'Create Quotation', onClick: openCreate, icon: Plus }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total" value={total} icon={FileText} />
        <StatsCard title="Draft" value={draftCount} icon={Pencil} />
        <StatsCard title="Sent" value={sentCount} icon={Send} />
        <StatsCard title="Accepted" value={acceptedCount} icon={Check} />
      </div>

      <DataTable
        columns={columns}
        data={quotations}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search quotations..."
        filters={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        }
      />

      <AnimatePresence>
        {dialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-2xl rounded-lg border bg-background p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editingQuotation ? 'Edit Quotation' : 'Create Quotation'}</h2>
                <button onClick={() => { setDialogOpen(false); setEditingQuotation(null); }} className="rounded-md p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
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
                    <label className="text-sm font-medium">Valid Until</label>
                    <input {...form.register('validUntil')} type="date" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Discount</label>
                    <input {...form.register('discount', { valueAsNumber: true })} type="number" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
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
                          {fields.length > 1 && <button type="button" onClick={() => remove(index)} className="rounded-md p-1.5 hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>}
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
                  <button type="button" onClick={() => { setDialogOpen(false); setEditingQuotation(null); }} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {editingQuotation ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewDialogOpen && viewingQuotation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Quotation {viewingQuotation.reference ?? viewingQuotation.id.slice(0, 8)}</h2>
                <button onClick={() => setViewDialogOpen(false)} className="rounded-md p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{viewingQuotation.customerName ?? '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(viewingQuotation.createdAt)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Valid Until</span><span>{viewingQuotation.validUntil ? formatDate(viewingQuotation.validUntil) : '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span>{statusBadge(viewingQuotation.status)}</div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{formatCurrency(viewingQuotation.total ?? 0)}</span></div>
                {viewingQuotation.items && viewingQuotation.items.length > 0 && (
                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">Items</h4>
                    {viewingQuotation.items.map((item: QuotationItem, i: number) => (
                      <div key={i} className="flex justify-between py-1 border-b last:border-0">
                        <span>{item.description} x{item.quantity}</span>
                        <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setViewDialogOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
