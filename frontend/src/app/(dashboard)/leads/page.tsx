'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, GripVertical, Phone, Mail, Building2, DollarSign, Target, Users, ArrowRight, Zap, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import { salesApi } from '@/features/sales/api/salesApi';
import { formatCurrency } from '@/lib/utils';
import type { Lead } from '@/types';

const leadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  company: z.string().optional(),
  source: z.enum(['website', 'referral', 'cold_call', 'social_media', 'advertisement', 'other']).default('website'),
  value: z.number().min(0).default(0),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).default('new'),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

const KANBAN_COLUMNS = [
  { id: 'new', label: 'New', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-amber-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-purple-500' },
  { id: 'converted', label: 'Converted', color: 'bg-emerald-500' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500' },
] as const;

const sourceColors: Record<string, string> = {
  website: 'bg-blue-100 text-blue-700',
  referral: 'bg-emerald-100 text-emerald-700',
  cold_call: 'bg-amber-100 text-amber-700',
  social_media: 'bg-purple-100 text-purple-700',
  advertisement: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', search],
    queryFn: () => salesApi.leads.get({ search, limit: 100 }),
  });

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: '', email: '', phone: '', company: '', source: 'website', value: 0, status: 'new', notes: '' },
  });

  const createMutation = useMutation({
    mutationFn: (data: LeadFormData) => salesApi.leads.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created');
      setDialogOpen(false);
      form.reset();
    },
    onError: () => toast.error('Failed to create lead'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadFormData> }) => salesApi.leads.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated');
      setDialogOpen(false);
      setEditingLead(null);
      form.reset();
    },
    onError: () => toast.error('Failed to update lead'),
  });

  const leads = leadsData?.data?.results ?? [];
  const totalLeads = leadsData?.data?.count ?? 0;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified').length;
  const convertedLeads = leads.filter((l) => l.status === 'converted').length;

  const openCreate = () => {
    setEditingLead(null);
    form.reset({ name: '', email: '', phone: '', company: '', source: 'website', value: 0, status: 'new', notes: '' });
    setDialogOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    form.reset({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company ?? '',
      source: lead.source ?? 'website',
      value: lead.value ?? 0,
      status: lead.status,
      notes: lead.notes ?? '',
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: LeadFormData) => {
    if (editingLead) {
      updateMutation.mutate({ id: editingLead.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const moveLead = (leadId: string, newStatus: string) => {
    updateMutation.mutate({ id: leadId, data: { status: newStatus as LeadFormData['status'] } });
  };

  const getLeadsByStatus = (status: string) => leads.filter((l) => l.status === status);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Leads" action={{ label: 'Add Lead', onClick: openCreate, icon: Plus }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Leads" value={totalLeads} icon={Target} trend={15} />
        <StatsCard title="New" value={newLeads} icon={Zap} />
        <StatsCard title="Qualified" value={qualifiedLeads} icon={Users} />
        <StatsCard title="Converted" value={convertedLeads} icon={ArrowRight} trend={10} />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..." className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <div key={col.id} className="min-w-[280px] flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{getLeadsByStatus(col.id).length}</span>
            </div>
            <div className="space-y-3 min-h-[200px] rounded-lg border border-dashed p-2">
              <AnimatePresence>
                {getLeadsByStatus(col.id).map((lead) => (
                  <motion.div
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-lg border bg-card p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => { openEdit(lead); setSelectedLead(lead); }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium">{lead.name}</h4>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {lead.company && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Building2 className="h-3 w-3" />{lead.company}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Mail className="h-3 w-3" />{lead.email}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sourceColors[lead.source] ?? 'bg-gray-100 text-gray-700'}`}>
                        {lead.source?.replace('_', ' ')}
                      </span>
                      {lead.value != null && lead.value > 0 && (
                        <span className="text-sm font-semibold">{formatCurrency(lead.value)}</span>
                      )}
                    </div>
                    {col.id !== 'new' && col.id !== 'lost' && (
                      <div className="flex gap-1 mt-2 pt-2 border-t">
                        {KANBAN_COLUMNS.filter((c) => c.id !== col.id && c.id !== 'lost').slice(0, 2).map((next) => (
                          <button
                            key={next.id}
                            onClick={(e) => { e.stopPropagation(); moveLead(lead.id, next.id); }}
                            className="text-xs rounded-md bg-muted px-2 py-1 hover:bg-muted/80"
                          >
                            → {next.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {dialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editingLead ? 'Edit Lead' : 'Add Lead'}</h2>
                <button onClick={() => { setDialogOpen(false); setEditingLead(null); setSelectedLead(null); }} className="rounded-md p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <input {...form.register('company')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Value</label>
                    <input {...form.register('value', { valueAsNumber: true })} type="number" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Source</label>
                    <select {...form.register('source')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="cold_call">Cold Call</option>
                      <option value="social_media">Social Media</option>
                      <option value="advertisement">Advertisement</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select {...form.register('status')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea {...form.register('notes')} rows={3} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setDialogOpen(false); setEditingLead(null); }} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {editingLead ? 'Update' : 'Create'}
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
