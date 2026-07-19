'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, ShoppingCart, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import { salesApi } from '@/features/sales/api/salesApi';
import { formatDate, formatCurrency } from '@/lib/utils';

const STATUS_PIPELINE = [
  { id: 'pending', label: 'Pending', color: 'bg-amber-500' },
  { id: 'processing', label: 'Processing', color: 'bg-blue-500' },
  { id: 'shipped', label: 'Shipped', color: 'bg-purple-500' },
  { id: 'delivered', label: 'Delivered', color: 'bg-emerald-500' },
  { id: 'completed', label: 'Completed', color: 'bg-green-600' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

export default function SalesOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: ordersData } = useQuery({
    queryKey: ['sales-orders', search, statusFilter],
    queryFn: () => salesApi.orders.get({ search, status: statusFilter !== 'all' ? statusFilter : undefined, limit: 50 }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => salesApi.orders.cancel(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales-orders'] }); toast.success('Order cancelled'); },
    onError: () => toast.error('Failed to cancel order'),
  });

  const orders = ordersData?.data?.results ?? [];
  const total = ordersData?.data?.count ?? 0;
  const pendingCount = orders.filter((o: any) => o.status === 'pending').length;
  const processingCount = orders.filter((o: any) => o.status === 'processing').length;
  const completedCount = orders.filter((o: any) => o.status === 'completed').length;

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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Sales Orders" action={{ label: 'New Order', onClick: () => router.push('/sales-orders/new'), icon: Plus }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Orders" value={total} icon={ShoppingCart} />
        <StatsCard title="Pending" value={pendingCount} icon={Clock} />
        <StatsCard title="Processing" value={processingCount} icon={Truck} />
        <StatsCard title="Completed" value={completedCount} icon={CheckCircle2} />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STATUS_PIPELINE.filter((s) => s.id !== 'cancelled').map((stage, i) => {
            const count = orders.filter((o: any) => o.status === stage.id).length;
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

      <div className="rounded-xl border bg-card">
        <div className="flex items-center gap-2 p-4 border-b">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
            <option value="all">All Status</option>
            {STATUS_PIPELINE.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-4 font-medium">{order.reference ?? String(order.id).slice(0, 8)}</td>
                  <td className="p-4">{order.customer_name ?? order.customer ?? '-'}</td>
                  <td className="p-4 text-muted-foreground">{formatDate(order.date ?? order.created_at ?? new Date())}</td>
                  <td className="p-4 text-right">{formatCurrency(order.total ?? 0)}</td>
                  <td className="p-4">{statusBadge(order.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <button onClick={() => cancelMutation.mutate(order.id)} className="rounded-md p-1.5 hover:bg-destructive/10 text-destructive"><XCircle className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
