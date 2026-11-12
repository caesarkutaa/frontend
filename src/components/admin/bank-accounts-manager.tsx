'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Landmark, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { ActiveBadge, AdminTitle, ConfirmDialog, ErrorBox, Modal, fieldClass } from './admin-ui';
import type { BankAccount } from '@/types';

const KEY = ['admin-bank-accounts'];

const schema = z.object({
  bankName: z.string().trim().min(2, 'Enter the bank name').max(80),
  accountName: z.string().trim().min(2, 'Enter the account name').max(100),
  accountNumber: z.string().trim().regex(/^\d{10}$/, 'Account number must be exactly 10 digits'),
  note: z.string().trim().max(300).optional(),
  isActive: z.boolean(),
});
type Values = z.infer<typeof schema>;

export function BankAccountsManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<BankAccount | 'new' | null>(null);
  const [deleting, setDeleting] = useState<BankAccount | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: KEY,
    queryFn: async () => (await api.get<BankAccount[]>('/payments/bank-accounts/admin')).data,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: KEY });

  const toggleMutation = useMutation({
    mutationFn: async (a: BankAccount) => api.patch(`/payments/bank-accounts/${a._id}`, { isActive: !a.isActive }),
    onSuccess: () => { refresh(); toast.success('Account updated'); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/payments/bank-accounts/${id}`),
    onSuccess: () => { refresh(); setDeleting(null); toast.success('Account deleted'); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const activeCount = data?.filter((a) => a.isActive).length ?? 0;

  return (
    <div>
      <AdminTitle
        title="Bank accounts"
        description="Customers paying by bank transfer see the active accounts at checkout."
        actions={<Button variant="gold" onClick={() => setEditing('new')}><Plus size={16} /> Add account</Button>}
      />

      {data && activeCount === 0 && (
        <p className="mb-6 border-l-4 border-error bg-error/10 p-4 text-sm text-error">No active bank account — bank transfer is hidden at checkout until you add or enable one.</p>
      )}

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorBox message={getErrorMessage(error)} />
      ) : data?.length === 0 ? (
        <div className="flex flex-col items-center border-t-4 border-gold bg-white px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center bg-navy text-gold"><Landmark size={26} /></span>
          <p className="mt-4 font-serif text-2xl">No bank accounts yet</p>
          <Button variant="gold" className="mt-6" onClick={() => setEditing('new')}><Plus size={16} /> Add your first account</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.map((a) => (
            <div key={a._id} className={cn('flex flex-col p-5', a.isActive ? 'bg-navy text-white' : 'border border-navy/15 bg-white opacity-75')}>
              <div className="flex items-start justify-between gap-2">
                <p className={cn('text-xs font-bold uppercase tracking-[0.2em]', a.isActive ? 'text-gold' : 'text-navy/60')}>{a.bankName}</p>
                <ActiveBadge active={!!a.isActive} activeLabel="Shown" inactiveLabel="Hidden" />
              </div>
              <p className="mt-3 font-mono text-2xl font-semibold tracking-wider">{a.accountNumber}</p>
              <p className={cn('mt-1 text-sm', a.isActive ? 'text-white/80' : 'text-navy/70')}>{a.accountName}</p>
              {a.note && <p className={cn('mt-2 text-xs', a.isActive ? 'text-gold-light' : 'text-navy/55')}>{a.note}</p>}
              <div className="mt-5 flex flex-wrap gap-2 border-t border-gold/30 pt-4">
                <button type="button" onClick={() => setEditing(a)} className="inline-flex items-center gap-1 bg-gold px-3 py-1.5 text-xs font-semibold uppercase text-navy hover:bg-gold-light"><Pencil size={12} /> Edit</button>
                <button type="button" disabled={toggleMutation.isPending} onClick={() => toggleMutation.mutate(a)} className={cn('inline-flex items-center gap-1 border px-3 py-1.5 text-xs font-semibold uppercase', a.isActive ? 'border-gold text-gold hover:bg-gold hover:text-navy' : 'border-navy text-navy hover:bg-navy hover:text-gold')}>
                  {a.isActive ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Show</>}
                </button>
                <button type="button" onClick={() => setDeleting(a)} aria-label="Delete" className="ml-auto flex h-8 w-8 items-center justify-center opacity-70 hover:text-error hover:opacity-100"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BankAccountModal account={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null); }} />

      <ConfirmDialog
        open={!!deleting}
        title="Delete bank account?"
        message={<>{deleting?.bankName} · {deleting?.accountNumber} will be removed. Past orders keep their own record.</>}
        confirmLabel="Delete"
        tone="danger"
        loading={deleteMutation.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
      />
    </div>
  );
}

function BankAccountModal({ account, onClose, onSaved }: { account: BankAccount | 'new' | null; onClose: () => void; onSaved: () => void }) {
  const isNew = account === 'new';
  const existing = account && account !== 'new' ? account : null;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!account) return;
    reset({
      bankName: existing?.bankName ?? '',
      accountName: existing?.accountName ?? '',
      accountNumber: existing?.accountNumber ?? '',
      note: existing?.note ?? '',
      isActive: existing?.isActive ?? true,
    });
  }, [account]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (values: Values) => {
    const body = { ...values, note: values.note || undefined };
    try {
      if (isNew) await api.post('/payments/bank-accounts', body);
      else await api.patch(`/payments/bank-accounts/${existing!._id}`, body);
      toast.success(isNew ? 'Bank account added' : 'Bank account updated');
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Modal
      open={!!account}
      onClose={onClose}
      title={isNew ? 'Add bank account' : 'Edit bank account'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="gold" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>{isNew ? 'Add account' : 'Save'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input label="Bank name" placeholder="e.g. GTBank, Opay, Moniepoint" error={errors.bankName?.message} {...register('bankName')} />
        <Input label="Account name" placeholder="e.g. Perfume Store Ltd" error={errors.accountName?.message} {...register('accountName')} />
        <Input label="Account number" inputMode="numeric" maxLength={10} placeholder="10 digits" error={errors.accountNumber?.message} {...register('accountNumber')} />
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">Note (optional)</label>
          <textarea rows={2} maxLength={300} placeholder="Shown under the account at checkout" className={cn(fieldClass, 'py-2.5')} {...register('note')} />
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-navy" {...register('isActive')} /> Show to customers
        </label>
      </form>
    </Modal>
  );
}