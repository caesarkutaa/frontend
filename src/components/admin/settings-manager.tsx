'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ExternalLink, Megaphone, MessageCircle, Phone, Save, Truck } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { NIGERIAN_STATES } from '@/lib/constants';
import { cn, formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { AdminTitle, ErrorBox, Panel, fieldClass } from './admin-ui';
import type { StoreSettings } from '@/types/settings';

interface FormState {
  announcementEnabled: boolean;
  announcementText: string;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappMessage: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  businessHours: string;
  defaultFee: string;
  freeShippingMin: string;
  estimatedDays: string;
  stateFees: Record<string, string>; // state -> fee ('' = use default)
}

const toForm = (s: StoreSettings): FormState => ({
  announcementEnabled: s.announcement?.enabled ?? true,
  announcementText: s.announcement?.text ?? '',
  whatsappEnabled: s.whatsapp?.enabled ?? false,
  whatsappNumber: s.whatsapp?.number ?? '',
  whatsappMessage: s.whatsapp?.message ?? '',
  phone: s.contact?.phone ?? '',
  email: s.contact?.email ?? '',
  address: s.contact?.address ?? '',
  instagram: s.contact?.instagram ?? '',
  businessHours: s.contact?.businessHours ?? '',
  defaultFee: String(s.delivery?.defaultFee ?? 0),
  freeShippingMin: String(s.delivery?.freeShippingMin ?? 0),
  estimatedDays: s.delivery?.estimatedDays ?? '',
  stateFees: Object.fromEntries((s.delivery?.stateFees ?? []).map((f) => [f.state, String(f.fee)])),
});

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-navy/50">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm font-semibold"
    >
      <span className={cn('relative h-7 w-12 rounded-full transition-colors', checked ? 'bg-gold' : 'bg-navy/20')}>
        <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-6' : 'left-1')} />
      </span>
      {label}: <span className={checked ? 'text-success' : 'text-navy/50'}>{checked ? 'ON' : 'OFF'}</span>
    </button>
  );
}

export function SettingsManager() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => (await api.get<StoreSettings>('/settings')).data,
  });

  useEffect(() => {
    if (data) setForm(toForm(data));
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (f: FormState) => {
      const stateFees = Object.entries(f.stateFees)
        .filter(([, fee]) => fee.trim() !== '')
        .map(([state, fee]) => ({ state, fee: Number(fee) }));

      return (
        await api.patch<StoreSettings>('/settings', {
          announcement: { enabled: f.announcementEnabled, text: f.announcementText },
          whatsapp: { enabled: f.whatsappEnabled, number: f.whatsappNumber, message: f.whatsappMessage },
          contact: { phone: f.phone, email: f.email, address: f.address, instagram: f.instagram, businessHours: f.businessHours },
          delivery: {
            defaultFee: Number(f.defaultFee || 0),
            freeShippingMin: Number(f.freeShippingMin || 0),
            estimatedDays: f.estimatedDays,
            stateFees,
          },
        })
      ).data;
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(['admin-settings'], saved);
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      toast.success('Settings saved — the store is updated');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not save settings')),
  });

  if (isLoading || !form) return isError ? <ErrorBox message={getErrorMessage(error)} /> : <PageLoader label="Loading settings..." />;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));
  const setStateFee = (state: string, value: string) =>
    setForm((f) => (f ? { ...f, stateFees: { ...f.stateFees, [state]: value } } : f));

  const whatsappTestNumber = form.whatsappNumber.replace(/\D/g, '').replace(/^0(\d{10})$/, '234$1');
  const customStates = Object.values(form.stateFees).filter((v) => v.trim() !== '').length;

  const save = () => mutation.mutate(form);

  return (
    <div className="space-y-6 pb-24">
      <AdminTitle
        title="Store settings"
        description="Changes appear on the store immediately after saving."
        actions={<Button variant="gold" loading={mutation.isPending} onClick={save}><Save size={16} /> Save settings</Button>}
      />

      {/* Announcement */}
      <Panel title={<span className="flex items-center gap-2"><Megaphone size={16} className="text-gold-dark" /> Announcement bar</span>}>
        <div className="space-y-4">
          <Toggle checked={form.announcementEnabled} onChange={(v) => set('announcementEnabled', v)} label="Show bar" />
          <Field label="Text" hint="Shown in gold at the very top of every page">
            <input className={cn(fieldClass, 'h-11')} maxLength={120} value={form.announcementText} onChange={(e) => set('announcementText', e.target.value)} />
          </Field>
        </div>
      </Panel>

      {/* WhatsApp */}
      <Panel title={<span className="flex items-center gap-2"><MessageCircle size={16} className="text-gold-dark" /> WhatsApp chat button</span>}>
        <div className="space-y-4">
          <Toggle checked={form.whatsappEnabled} onChange={(v) => set('whatsappEnabled', v)} label="Show button" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Business WhatsApp number" hint="e.g. 08031234567 or 2348031234567 — converted to international format">
              <input className={cn(fieldClass, 'h-11')} inputMode="tel" value={form.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} />
            </Field>
            <Field label="Pre-filled message">
              <input className={cn(fieldClass, 'h-11')} maxLength={300} value={form.whatsappMessage} onChange={(e) => set('whatsappMessage', e.target.value)} />
            </Field>
          </div>
          {whatsappTestNumber.length >= 10 && (
            <a
              href={`https://wa.me/${whatsappTestNumber}?text=${encodeURIComponent(form.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-gold-dark hover:text-navy"
            >
              <ExternalLink size={14} /> Test this number
            </a>
          )}
          {form.whatsappEnabled && !form.whatsappNumber && (
            <p className="text-xs text-error">Add a number — the button stays hidden until there is one.</p>
          )}
        </div>
      </Panel>

      {/* Contact */}
      <Panel title={<span className="flex items-center gap-2"><Phone size={16} className="text-gold-dark" /> Contact details</span>}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Phone"><input className={cn(fieldClass, 'h-11')} value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
          <Field label="Email"><input type="email" className={cn(fieldClass, 'h-11')} value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
          <Field label="Instagram handle"><input className={cn(fieldClass, 'h-11')} placeholder="@yourstore" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} /></Field>
          <Field label="Business hours"><input className={cn(fieldClass, 'h-11')} placeholder="Mon–Sat, 9am–6pm" value={form.businessHours} onChange={(e) => set('businessHours', e.target.value)} /></Field>
          <div className="md:col-span-2">
            <Field label="Address"><textarea rows={2} className={cn(fieldClass, 'py-2.5')} value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
          </div>
        </div>
      </Panel>

      {/* Delivery */}
      <Panel title={<span className="flex items-center gap-2"><Truck size={16} className="text-gold-dark" /> Delivery fees</span>}>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Default fee (₦)" hint="For any state without a custom fee. 0 = free">
            <input type="number" min={0} inputMode="numeric" className={cn(fieldClass, 'h-11')} value={form.defaultFee} onChange={(e) => set('defaultFee', e.target.value)} />
          </Field>
          <Field label="Free delivery over (₦)" hint="0 = off">
            <input type="number" min={0} inputMode="numeric" className={cn(fieldClass, 'h-11')} value={form.freeShippingMin} onChange={(e) => set('freeShippingMin', e.target.value)} />
          </Field>
          <Field label="Delivery time">
            <input className={cn(fieldClass, 'h-11')} placeholder="2–5 working days" value={form.estimatedDays} onChange={(e) => set('estimatedDays', e.target.value)} />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider">Fee per state</h3>
          <p className="text-xs text-navy/55">
            {customStates} custom · empty = default ({formatNaira(Number(form.defaultFee || 0))})
          </p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {NIGERIAN_STATES.map((state) => {
            const value = form.stateFees[state] ?? '';
            return (
              <label key={state} className={cn('flex items-center justify-between gap-3 border px-3 py-2', value ? 'border-gold bg-gold/10' : 'border-navy/10')}>
                <span className="text-sm font-medium">{state}</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Default"
                  value={value}
                  onChange={(e) => setStateFee(state, e.target.value)}
                  className="h-9 w-28 border border-navy/20 bg-white px-2 text-right text-sm outline-none focus:border-gold"
                />
              </label>
            );
          })}
        </div>
      </Panel>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-gold bg-navy p-3 lg:left-64">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-1 sm:px-3">
          <p className="hidden text-sm text-white/75 sm:block">Remember to save your changes.</p>
          <Button variant="gold" loading={mutation.isPending} onClick={save} className="w-full sm:w-auto">
            <Save size={16} /> Save settings
          </Button>
        </div>
      </div>
    </div>
  );
}