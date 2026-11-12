'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search, X, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ---------- Shared class strings ---------- */
export const th = 'whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gold';
export const td = 'px-4 py-3 align-middle text-sm';
export const fieldClass =
  'w-full border border-navy/20 bg-white px-3 text-sm text-navy outline-none placeholder:text-navy/35 focus:border-gold';

/* ---------- Page title ---------- */
export function AdminTitle({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-2xl font-medium sm:text-3xl">{title}</h1>
        <div className="mt-2 h-0.5 w-12 bg-gold" />
        {description && <div className="mt-2 text-sm text-navy/60">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Panel ---------- */
export function Panel({ title, actions, children, className, bodyClassName }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn('border border-navy/10 bg-white', className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 px-4 py-3 sm:px-5">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider">{title}</h2>
          {actions}
        </div>
      )}
      <div className={cn('p-4 sm:p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

/* ---------- Stat card ---------- */
type Tone = 'navy' | 'gold' | 'white' | 'error';
export function StatCard({ label, value, hint, icon: Icon, tone = 'white', href }: { label: string; value: ReactNode; hint?: ReactNode; icon?: LucideIcon; tone?: Tone; href?: string }) {
  const content = (
    <div
      className={cn(
        'flex h-full items-start justify-between gap-3 p-4 sm:p-5',
        tone === 'navy' && 'bg-navy text-white',
        tone === 'gold' && 'bg-gold text-navy',
        tone === 'white' && 'border border-navy/10 bg-white',
        tone === 'error' && 'border border-error/40 bg-error/10',
      )}
    >
      <div className="min-w-0">
        <p className={cn('text-[11px] font-bold uppercase tracking-wider', tone === 'navy' ? 'text-gold' : tone === 'gold' ? 'text-navy/70' : 'text-navy/55')}>{label}</p>
        <p className="mt-2 truncate text-2xl font-semibold sm:text-3xl">{value}</p>
        {hint && <p className={cn('mt-1 text-xs', tone === 'navy' ? 'text-white/60' : 'text-navy/60')}>{hint}</p>}
      </div>
      {Icon && (
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center', tone === 'navy' ? 'bg-gold text-navy' : 'bg-navy text-gold')}>
          <Icon size={18} />
        </span>
      )}
    </div>
  );
  return href ? <Link href={href} className="block h-full transition-opacity hover:opacity-90">{content}</Link> : content;
}

/* ---------- Table wrapper (scrolls sideways on small screens) ---------- */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-navy/10 bg-white">
      <table className="w-full min-w-[720px] border-collapse">{children}</table>
    </div>
  );
}

export function TableHead({ columns }: { columns: string[] }) {
  return (
    <thead className="bg-navy">
      <tr>
        {columns.map((c, i) => (
          <th key={`${c}-${i}`} className={th}>{c}</th>
        ))}
      </tr>
    </thead>
  );
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-navy/55">{message}</td>
    </tr>
  );
}

/* ---------- Badges ---------- */
export function ActiveBadge({ active, activeLabel = 'Active', inactiveLabel = 'Hidden' }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return (
    <span className={cn('inline-flex border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider', active ? 'border-success/40 bg-success/10 text-success' : 'border-navy/20 bg-navy/5 text-navy/60')}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

/* ---------- Search (debounced) ---------- */
export function SearchBox({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  useEffect(() => {
    if (text === value) return;
    const timer = setTimeout(() => onChange(text.trim()), 400);
    return () => clearTimeout(timer);
  }, [text, value, onChange]);

  return (
    <div className="relative w-full sm:w-72">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gold-dark" />
      <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className={cn(fieldClass, 'h-10 pl-9')} />
    </div>
  );
}

/* ---------- Select filter ---------- */
export function FilterSelect({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={cn(fieldClass, 'h-10 w-full sm:w-auto')}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/* ---------- Pagination ---------- */
export function AdminPagination({ meta, onPage }: { meta?: { page: number; totalPages: number; total: number }; onPage: (page: number) => void }) {
  if (!meta || meta.totalPages <= 1) return null;
  const btn =
    'flex h-10 items-center gap-1 border border-navy px-3 text-xs font-semibold uppercase tracking-wider hover:bg-navy hover:text-gold disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-navy';
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-xs text-navy/55">{meta.total} total</p>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
          <ChevronLeft size={14} /> <span className="hidden xs:inline">Prev</span>
        </button>
        <span className="text-sm">
          <span className="font-bold">{meta.page}</span> / {meta.totalPages}
        </span>
        <button type="button" className={btn} disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>
          <span className="hidden xs:inline">Next</span> <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ---------- Modal (bottom sheet on mobile) ---------- */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: 'md' | 'lg' }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-navy-dark/60" onClick={onClose} />
      <div className={cn('relative flex max-h-[92vh] w-full flex-col border-t-4 border-gold bg-white', size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg')}>
        <div className="flex items-center justify-between border-b border-navy/10 px-5 py-4">
          <h2 className="font-serif text-xl">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center hover:text-gold-dark">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-navy/10 px-5 py-4 xs:flex-row xs:justify-end">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Confirm dialog (optional reason) ---------- */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'primary',
  reason,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  tone?: 'primary' | 'gold' | 'danger';
  reason?: { label: string; placeholder?: string; required?: boolean };
  loading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (open) setText('');
  }, [open]);
  const invalid = !!reason?.required && text.trim().length < 3;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={tone} loading={loading} disabled={invalid} onClick={() => onConfirm(text.trim())}>{confirmLabel}</Button>
        </>
      }
    >
      {message && <div className="text-sm text-navy/75">{message}</div>}
      {reason && (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">
            {reason.label} {!reason.required && <span className="font-normal normal-case text-navy/50">(optional)</span>}
          </label>
          <textarea rows={3} maxLength={300} value={text} onChange={(e) => setText(e.target.value)} placeholder={reason.placeholder} className={cn(fieldClass, 'py-2.5')} />
        </div>
      )}
    </Modal>
  );
}

/* ---------- Simple error box ---------- */
export function ErrorBox({ message }: { message: string }) {
  return <p className="border-l-4 border-error bg-error/10 p-4 text-sm text-error">{message}</p>;
}