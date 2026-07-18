'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Eye, Package, Clock, CheckCircle2, AlertCircle, Warehouse } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/layout/DataTable';
import StatsCard from '@/components/shared/StatsCard';
import { purchaseApi } from '@/features/purchase/api/purchaseApi';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { GoodsReceipt } from '@/types';

const receiptItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  orderedQuantity: z.number().min(0),
  receivedQuantity: z.number().min(0, 'Received quantity must be at least 0'),
  unitPrice: z.number().min(0),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
});

const receiptSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase order is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  receivedDate: z.string().min(1, 'Received date is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(receiptItemSchema).min(1, 'At least one item is required'),
});

type ReceiptFormData = z.infer<typeof receiptSchema>;

export default function GoodsReceiptPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<GoodsReceipt | null>(null);

  const { data: receiptsData, isLoading } = useQuery({
    queryKey: ['goods-receipts', search, statusFilter],
    queryFn: () => purchaseApi.receipts.get({ search, status: statusFilter !== 'all' ? statusFilter : undefined, limit: 50 }),
  });

  const form = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      purchaseOrderId: '',
      warehouseId: '',
      receivedDate: '',
      reference: '',
      notes: '',
      items: [{ description: '', orderedQuantity: 0, receivedQuantity: 0, unitPrice: 0, batchNumber: '', expiryDate: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const createMutation = useMutation({
    mutationFn: (data: ReceiptFormData) => purchaseApi.receipts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      toast.success('Goods receipt created');
      setDialogOpen(false);
      form.reset();
    },
    onError: () => toast.error('Failed to create goods receipt'),
  });

  const receipts = receiptsData?.data?.items ?? [];
  const total = receiptsData?.data?.total ?? 0;
  const pendingCount = receipts.filter((r) => r.status === 'pending').length;
  const completedCount = receipts.filter((r) => r.status === 'completed').length;
  const partialCount = receipts.filter((r) => r.status === 'partial').length;

  const openCreate = () => {
    form.reset({
      purchaseOrderId: '',
      warehouseId: '',
      receivedDate: '',
      reference: '',
      notes: '',
      items: [{ description: '', orderedQuantity: 0, receivedQuantity: 0, unitPrice: 0, batchNumber: '', expiryDate: '' }],
    });
    setDialogOpen(true);
  };

  const openView = (receipt: GoodsReceipt) => {
    setViewingReceipt(receipt);
    setViewDialogOpen(true);
  };

  const onSubmit = (data: ReceiptFormData) => {
    createMutation.mutate(data);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      completed: 'bg-emerald-100 text-emerald-700',
      partial: 'bg-purple-100 text-purple-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  const columns = [
    { key: 'reference', header: 'Receipt #', render: (r: GoodsReceipt) => <span className="font-medium">{r.reference ?? r.id.slice(0, 8)}</span> },
    { key: 'po', header: 'PO', render: (r: GoodsReceipt) => r.purchaseOrderReference ?? r.purchaseOrderId?.slice(0, 8) ?? '-' },
    { key: 'warehouse', header: 'Warehouse', render: (r: GoodsReceipt) => r.warehouseName ?? '-' },
    { key: 'date', header: 'Date', render: (r: GoodsReceipt) => formatDate(r.receivedDate ?? r.createdAt) },
    { key: 'status', header: 'Status', render: (r: GoodsReceipt) => statusBadge(r.status) },
    {
      key: 'actions',
      header: '',
      render: (r: GoodsReceipt) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openView(r)} className="rounded-md p-1.5 hover:bg-muted"><Eye className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Goods Receipt" action={{ label: 'Create Receipt', onClick: openCreate, icon: Plus }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Receipts" value={total} icon={Package} />
        <StatsCard title="Pending" value={pendingCount} icon={Clock} />
        <StatsCard title="Completed" value={completedCount} icon={CheckCircle2} />
        <StatsCard title="Partial" value={partialCount} icon={AlertCircle} />
      </div>

      <DataTable
        columns={columns}
        data={receipts}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search receipts..."
        filters={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="partial">Partial</option>
          </select>
        }
      />

      <AnimatePresence>
        {dialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-2xl rounded-lg border bg-background p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Create Goods Receipt</h2>
                <button onClick={() => setDialogOpen(false)} className="rounded-md p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Purchase Order ID</label>
                    <input {...form.register('purchaseOrderId')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    {form.formState.errors.purchaseOrderId && <p className="text-xs text-destructive mt-1">{form.formState.errors.purchaseOrderId.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Warehouse ID</label>
                    <input {...form.register('warehouseId')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Warehouse ID" />
                    {form.formState.errors.warehouseId && <p className="text-xs text-destructive mt-1">{form.formState.errors.warehouseId.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Received Date</label>
                    <input {...form.register('receivedDate')} type="date" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reference</label>
                    <input {...form.register('reference')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Items</label>
                    <button type="button" onClick={() => append({ description: '', orderedQuantity: 0, receivedQuantity: 0, unitPrice: 0, batchNumber: '', expiryDate: '' })} className="text-sm text-primary hover:underline">+ Add Item</button>
                  </div>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="rounded-lg border p-3 space-y-2">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">Description</label>
                            <input {...form.register(`items.${index}.description`)} className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Ordered</label>
                            <input {...form.register(`items.${index}.orderedQuantity`, { valueAsNumber: true })} type="number" className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Received</label>
                            <input {...form.register(`items.${index}.receivedQuantity`, { valueAsNumber: true })} type="number" className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 items-end">
                          <div>
                            <label className="text-xs text-muted-foreground">Unit Price</label>
                            <input {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })} type="number" className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Batch #</label>
                            <input {...form.register(`items.${index}.batchNumber`)} className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Expiry Date</label>
                            <input {...form.register(`items.${index}.expiryDate`)} type="date" className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm" />
                          </div>
                          <div>
                            {fields.length > 1 && <button type="button" onClick={() => remove(index)} className="rounded-md p-1.5 hover:bg-destructive/10 text-destructive"><X className="h-4 w-4" /></button>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea {...form.register('notes')} rows={2} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setDialogOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewDialogOpen && viewingReceipt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Receipt {viewingReceipt.reference ?? viewingReceipt.id.slice(0, 8)}</h2>
                <button onClick={() => setViewDialogOpen(false)} className="rounded-md p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Purchase Order</span><span>{viewingReceipt.purchaseOrderReference ?? '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Warehouse</span><span>{viewingReceipt.warehouseName ?? '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(viewingReceipt.receivedDate ?? viewingReceipt.createdAt)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span>{statusBadge(viewingReceipt.status)}</div>
                {viewingReceipt.items && viewingReceipt.items.length > 0 && (
                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">Items</h4>
                    {viewingReceipt.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between py-1 border-b last:border-0">
                        <span>{item.description}</span>
                        <span>{item.receivedQuantity ?? 0} received</span>
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
