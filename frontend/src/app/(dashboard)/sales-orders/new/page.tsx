'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import { salesApi } from '@/features/sales/api/salesApi';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Price must be positive'),
  tax: z.coerce.number().min(0).default(0),
});

const orderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  reference: z.string().optional(),
  orderDate: z.string().min(1, 'Order date is required'),
  expectedDelivery: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'At least one item is required'),
  discount: z.coerce.number().min(0).default(0),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function NewSalesOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: '',
      reference: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: '',
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, tax: 0 }],
      discount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => salesApi.orders.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      toast.success('Order created successfully');
      router.push('/sales-orders');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to create order';
      toast.error(msg);
    },
  });

  const onSubmit = (data: OrderFormData) => {
    const items = data.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      tax_rate: item.tax,
      total: +(item.quantity * item.unitPrice + item.quantity * item.unitPrice * (item.tax / 100)).toFixed(2),
    }));

    const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const taxAmount = items.reduce((s, i) => s + i.quantity * i.unit_price * (i.tax_rate / 100), 0);

    const companyId = user?.company && typeof user.company === 'object' ? (user.company as any).id : null;

    const payload: Record<string, any> = {
      customer: data.customerId,
      created_by: user?.id,
      ...(companyId ? { company: companyId } : {}),
      date: data.orderDate,
      required_date: data.expectedDelivery || null,
      shipping_address: null,
      notes: data.notes || null,
      status: 'draft',
      subtotal: +subtotal.toFixed(2),
      tax_amount: +taxAmount.toFixed(2),
      discount_amount: data.discount,
      total: +(subtotal + taxAmount - data.discount).toFixed(2),
      items,
    };

    createMutation.mutate(payload);
  };

  const watchedItems = form.watch('items');
  const subtotal = watchedItems?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) ?? 0;
  const taxTotal = watchedItems?.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.tax / 100)), 0) ?? 0;
  const discount = form.watch('discount') ?? 0;
  const grandTotal = subtotal + taxTotal - discount;

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="mb-4">
        <Link
          href="/sales-orders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sales Orders
        </Link>
      </div>

      <PageHeader title="New Sales Order" />

      {hasErrors && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-destructive font-medium">
            <AlertCircle className="h-4 w-4" />
            Please fix the validation errors below before submitting.
          </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit, () => toast.error('Please fill in all required fields'))} className="space-y-6">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-base font-semibold mb-4">Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Customer ID *</label>
              <input
                {...form.register('customerId')}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Enter customer ID"
              />
              {form.formState.errors.customerId && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.customerId.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Reference</label>
              <input
                {...form.register('reference')}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="e.g. SO-001"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Order Date *</label>
              <input
                {...form.register('orderDate')}
                type="date"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
              {form.formState.errors.orderDate && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.orderDate.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Expected Delivery</label>
              <input
                {...form.register('expectedDelivery')}
                type="date"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Line Items</h2>
            <button
              type="button"
              onClick={() => append({ description: '', quantity: 1, unitPrice: 0, tax: 0 })}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          {form.formState.errors.items?.message && (
            <p className="text-xs text-destructive mb-3">{form.formState.errors.items.message}</p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  {index === 0 && <label className="text-xs text-muted-foreground mb-1 block">Description *</label>}
                  <input
                    {...form.register(`items.${index}.description`)}
                    placeholder="Item description"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                  {form.formState.errors.items?.[index]?.description && (
                    <p className="text-xs text-destructive mt-1">
                      {form.formState.errors.items?.[index]?.description?.message}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  {index === 0 && <label className="text-xs text-muted-foreground mb-1 block">Qty *</label>}
                  <input
                    {...form.register(`items.${index}.quantity`)}
                    type="number"
                    min="1"
                    placeholder="1"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  {index === 0 && <label className="text-xs text-muted-foreground mb-1 block">Price *</label>}
                  <input
                    {...form.register(`items.${index}.unitPrice`)}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  {index === 0 && <label className="text-xs text-muted-foreground mb-1 block">Tax %</label>}
                  <input
                    {...form.register(`items.${index}.tax`)}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  {index === 0 && <label className="text-xs text-muted-foreground mb-1 block invisible">X</label>}
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded-md p-1.5 hover:bg-destructive/10 text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-base font-semibold mb-4">Order Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Discount</label>
              <input
                {...form.register('discount')}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(taxTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Grand Total</span>
                <span className="text-lg">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-base font-semibold mb-4">Notes</h2>
          <textarea
            {...form.register('notes')}
            rows={3}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Optional notes about this order..."
          />
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <Link
            href="/sales-orders"
            className="rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Create Order
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
