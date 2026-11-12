'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ImageUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, getErrorMessage } from '@/lib/api';
import { MAX_IMAGE_SIZE_MB } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { BankAccount } from '@/types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

interface PaymentProofFormProps {
  orderId: string;
  accounts: BankAccount[];
  amount: number;
  onSuccess: () => void;
}

export function PaymentProofForm({ orderId, accounts, amount, onSuccess }: PaymentProofFormProps) {
  const [bankAccountId, setBankAccountId] = useState(accounts[0]?._id ?? '');
  const [senderName, setSenderName] = useState('');
  const [amountPaid, setAmountPaid] = useState(String(amount));
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Free the preview URL when it changes / unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (selected: File | undefined) => {
    if (!selected) return;
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setErrors((e) => ({ ...e, file: 'Upload a JPG, PNG or WEBP image' }));
      return;
    }
    if (selected.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setErrors((e) => ({ ...e, file: `Image must be under ${MAX_IMAGE_SIZE_MB}MB` }));
      return;
    }
    setErrors((e) => ({ ...e, file: '' }));
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!bankAccountId) next.bankAccountId = 'Select the account you paid into';
    if (senderName.trim().length < 2) next.senderName = 'Enter the name on the account you paid from';
    if (amountPaid && (Number.isNaN(Number(amountPaid)) || Number(amountPaid) <= 0)) {
      next.amountPaid = 'Enter a valid amount';
    }
    if (!file) next.file = 'Upload a screenshot of your payment receipt';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !file) return;

    const formData = new FormData();
    formData.append('proof', file);
    formData.append('bankAccountId', bankAccountId);
    formData.append('senderName', senderName.trim());
    if (amountPaid) formData.append('amountPaid', amountPaid);
    if (note.trim()) formData.append('note', note.trim());

    setSubmitting(true);
    try {
      await api.post(`/orders/${orderId}/payment-proof`, formData);
      toast.success('Payment proof uploaded. We will confirm it shortly.');
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Upload failed, please try again'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {/* Which account */}
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider">
          Account you paid into
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {accounts.map((account) => (
            <label
              key={account._id}
              className={cn(
                'flex cursor-pointer items-start gap-3 border p-3 text-sm transition-colors',
                bankAccountId === account._id
                  ? 'border-navy bg-navy text-white'
                  : 'border-navy/20 hover:border-gold',
              )}
            >
              <input
                type="radio"
                name="bankAccountId"
                value={account._id}
                checked={bankAccountId === account._id}
                onChange={() => setBankAccountId(account._id)}
                className="mt-0.5 h-4 w-4 accent-gold"
              />
              <span className="min-w-0">
                <span
                  className={cn(
                    'block font-semibold',
                    bankAccountId === account._id ? 'text-gold' : 'text-navy',
                  )}
                >
                  {account.bankName}
                </span>
                <span className="block truncate text-xs opacity-80">
                  {account.accountNumber} · {account.accountName}
                </span>
              </span>
            </label>
          ))}
        </div>
        {errors.bankAccountId && <p className="mt-1.5 text-xs text-error">{errors.bankAccountId}</p>}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Sender's name"
          placeholder="Name on your bank account"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          error={errors.senderName}
        />
        <Input
          label="Amount sent (₦)"
          type="number"
          inputMode="numeric"
          min={0}
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          error={errors.amountPaid}
        />
      </div>

      {/* Screenshot */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider">Payment screenshot</p>
        {preview ? (
          <div className="relative w-full max-w-xs border-2 border-gold bg-surface p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Payment proof preview" className="max-h-80 w-full object-contain" />
            <button
              type="button"
              onClick={removeFile}
              aria-label="Remove screenshot"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-navy text-gold hover:bg-error hover:text-white"
            >
              <X size={16} />
            </button>
            <p className="mt-2 truncate text-xs text-navy/60">{file?.name}</p>
          </div>
        ) : (
          <label
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed px-4 py-10 text-center transition-colors hover:bg-gold/5',
              errors.file ? 'border-error' : 'border-gold',
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center bg-navy text-gold">
              <ImageUp size={22} />
            </span>
            <span className="text-sm font-semibold">Tap to upload your receipt screenshot</span>
            <span className="text-xs text-navy/55">JPG, PNG or WEBP · max {MAX_IMAGE_SIZE_MB}MB</span>
            <input
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        )}
        {errors.file && <p className="mt-1.5 text-xs text-error">{errors.file}</p>}
      </div>

      <div>
        <label htmlFor="proof-note" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">
          Note (optional)
        </label>
        <textarea
          id="proof-note"
          rows={3}
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything we should know about this payment"
          className="w-full border border-navy/20 bg-white px-3.5 py-3 text-sm text-navy outline-none placeholder:text-navy/35 focus:border-gold"
        />
      </div>

      <Button type="submit" variant="gold" size="lg" fullWidth loading={submitting}>
        Submit payment proof
      </Button>
    </form>
  );
}