'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StarInput } from './star-rating';

interface ReviewFormProps {
  perfumeId: string;
  existing?: { _id: string; rating: number; title?: string; comment: string };
  onSaved: () => void;
  onCancel?: () => void;
}

const field =
  'w-full border border-navy/20 bg-white px-3.5 text-sm text-navy outline-none placeholder:text-navy/35 focus:border-gold';

export function ReviewForm({ perfumeId, existing, onSaved, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!rating) next.rating = 'Tap a star to rate';
    if (comment.trim().length < 10) next.comment = 'Please write at least 10 characters';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const body = { rating, title: title.trim() || undefined, comment: comment.trim() };
      if (existing) await api.patch(`/reviews/${existing._id}`, body);
      else await api.post('/reviews', { perfumeId, ...body });
      toast.success(existing ? 'Your review was updated' : 'Thank you for your review!');
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save your review'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider">Your rating</p>
        <StarInput value={rating} onChange={setRating} />
        {errors.rating && <p className="mt-1.5 text-xs text-error">{errors.rating}</p>}
      </div>

      <div>
        <label htmlFor="review-title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">
          Title <span className="font-normal normal-case text-navy/50">(optional)</span>
        </label>
        <input id="review-title" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sum it up in a few words" className={cn(field, 'h-11')} />
      </div>

      <div>
        <label htmlFor="review-comment" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">Your review</label>
        <textarea
          id="review-comment"
          rows={5}
          maxLength={2000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How does it smell? How long does it last? Would you recommend it?"
          className={cn(field, 'py-3', errors.comment && 'border-error')}
        />
        <div className="mt-1 flex justify-between text-xs">
          <span className="text-error">{errors.comment}</span>
          <span className="text-navy/40">{comment.length}/2000</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 xs:flex-row">
        <Button type="submit" variant="gold" loading={saving}>{existing ? 'Update review' : 'Submit review'}</Button>
        {onCancel && <Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>}
      </div>
    </form>
  );
}