'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Monitor, Shield, Save, Upload, Eye, EyeOff, Check, X, Globe, Clock, Palette, Key, Smartphone, History } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

const companySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  logo: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().default('USD'),
  fiscalYearStart: z.string().optional(),
  taxId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

const systemSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  dateFormat: z.string().default('MM/dd/yyyy'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ProfileFormData = z.infer<typeof profileSchema>;
type CompanyFormData = z.infer<typeof companySchema>;
type SystemFormData = z.infer<typeof systemSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'security', label: 'Security', icon: Shield },
];

const loginHistory = [
  { id: '1', date: '2026-07-17 14:30', ip: '192.168.1.100', device: 'Chrome on Windows', location: 'New York, US', status: 'success' },
  { id: '2', date: '2026-07-16 09:15', ip: '192.168.1.100', device: 'Chrome on Windows', location: 'New York, US', status: 'success' },
  { id: '3', date: '2026-07-15 18:45', ip: '10.0.0.55', device: 'Safari on macOS', location: 'San Francisco, US', status: 'success' },
  { id: '4', date: '2026-07-14 11:20', ip: '172.16.0.10', device: 'Firefox on Linux', location: 'London, UK', status: 'failed' },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 890', avatar: '' },
  });

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: { companyName: 'Acme Corp', logo: '', address: '123 Business St', city: 'New York', country: 'US', currency: 'USD', fiscalYearStart: '01-01', taxId: 'US-12345678', phone: '+1 234 567 890', email: 'info@acme.com' },
  });

  const systemForm = useForm<SystemFormData>({
    resolver: zodResolver(systemSchema),
    defaultValues: { theme: 'system', language: 'en', timezone: 'UTC', dateFormat: 'MM/dd/yyyy', timeFormat: '12h' },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const saveProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => new Promise((resolve) => setTimeout(resolve, 500)),
    onSuccess: () => toast.success('Profile updated'),
  });

  const saveCompanyMutation = useMutation({
    mutationFn: (data: CompanyFormData) => new Promise((resolve) => setTimeout(resolve, 500)),
    onSuccess: () => toast.success('Company settings updated'),
  });

  const saveSystemMutation = useMutation({
    mutationFn: (data: SystemFormData) => new Promise((resolve) => setTimeout(resolve, 500)),
    onSuccess: () => toast.success('System settings updated'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => new Promise((resolve) => setTimeout(resolve, 500)),
    onSuccess: () => { toast.success('Password changed'); passwordForm.reset(); },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Settings" />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                <form onSubmit={profileForm.handleSubmit((d) => saveProfileMutation.mutate(d))} className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <button type="button" className="rounded-md border px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Upload Photo
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <input {...profileForm.register('name')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                      {profileForm.formState.errors.name && <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <input {...profileForm.register('email')} type="email" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                      {profileForm.formState.errors.email && <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <input {...profileForm.register('phone')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={saveProfileMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                      <Save className="h-4 w-4" /> {saveProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'company' && (
              <motion.div key="company" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Company Settings</h3>
                <form onSubmit={companyForm.handleSubmit((d) => saveCompanyMutation.mutate(d))} className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <button type="button" className="rounded-md border px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Upload Logo
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Company Name</label>
                      <input {...companyForm.register('companyName')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Address</label>
                      <input {...companyForm.register('address')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">City</label>
                      <input {...companyForm.register('city')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Country</label>
                      <input {...companyForm.register('country')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Currency</label>
                      <select {...companyForm.register('currency')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Fiscal Year Start</label>
                      <input {...companyForm.register('fiscalYearStart')} placeholder="MM-DD" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tax ID</label>
                      <input {...companyForm.register('taxId')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Company Phone</label>
                      <input {...companyForm.register('phone')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Company Email</label>
                      <input {...companyForm.register('email')} type="email" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={saveCompanyMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                      <Save className="h-4 w-4" /> {saveCompanyMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'system' && (
              <motion.div key="system" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">System Settings</h3>
                <form onSubmit={systemForm.handleSubmit((d) => saveSystemMutation.mutate(d))} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2"><Palette className="h-4 w-4" /> Theme</label>
                      <select {...systemForm.register('theme')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4" /> Language</label>
                      <select {...systemForm.register('language')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ar">Arabic</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Timezone</label>
                      <select {...systemForm.register('timezone')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time (US)</option>
                        <option value="America/Chicago">Central Time (US)</option>
                        <option value="America/Denver">Mountain Time (US)</option>
                        <option value="America/Los_Angeles">Pacific Time (US)</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Time Format</label>
                      <select {...systemForm.register('timeFormat')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                        <option value="12h">12 Hour</option>
                        <option value="24h">24 Hour</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Date Format</label>
                      <select {...systemForm.register('dateFormat')} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                        <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                        <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                        <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                        <option value="dd.MM.yyyy">DD.MM.YYYY</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={saveSystemMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                      <Save className="h-4 w-4" /> {saveSystemMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Key className="h-5 w-5" /> Change Password</h3>
                  <form onSubmit={passwordForm.handleSubmit((d) => changePasswordMutation.mutate(d))} className="space-y-4 max-w-md">
                    <div>
                      <label className="text-sm font-medium">Current Password</label>
                      <div className="relative mt-1">
                        <input {...passwordForm.register('currentPassword')} type={showPassword ? 'text' : 'password'} className="w-full rounded-md border bg-background px-3 py-2 text-sm pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">New Password</label>
                      <input {...passwordForm.register('newPassword')} type="password" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                      {passwordForm.formState.errors.newPassword && <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Confirm Password</label>
                      <input {...passwordForm.register('confirmPassword')} type="password" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                      {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
                    </div>
                    <button type="submit" disabled={changePasswordMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                      {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Smartphone className="h-5 w-5" /> Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Enable 2FA</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => { setTwoFAEnabled(!twoFAEnabled); toast.success(twoFAEnabled ? '2FA disabled' : '2FA enabled'); }}
                      className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', twoFAEnabled ? 'bg-primary' : 'bg-muted')}
                    >
                      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', twoFAEnabled ? 'translate-x-6' : 'translate-x-1')} />
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><History className="h-5 w-5" /> Login History</h3>
                  <div className="space-y-3">
                    {loginHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={cn('h-2 w-2 rounded-full', entry.status === 'success' ? 'bg-emerald-500' : 'bg-red-500')} />
                          <div>
                            <p className="text-sm font-medium">{entry.device}</p>
                            <p className="text-xs text-muted-foreground">{entry.ip} &middot; {entry.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{entry.date}</p>
                          <span className={cn('text-xs', entry.status === 'success' ? 'text-emerald-600' : 'text-red-600')}>
                            {entry.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
