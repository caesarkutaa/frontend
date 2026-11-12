'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ExternalLink, Eye, EyeOff, MessageSquareReply, Store, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { StarRating } from '@/components/reviews/star-rating';
import { AdminPagination, AdminTitle, ConfirmDialog, ErrorBox, FilterSelect, Modal, SearchBox, fieldClass } from './admin-ui';
import type { AdminReview } from '@/types/review';
import type { Paginated } from '@/types';

type Action = { type: 'hide' | 'show' | 'delete' | 'reply'; review: AdminReview } | null;

export function ReviewsManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('');
  const [visibility, setVisibility] = useState('');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<Action>(null);
  const [replyText, setReplyText] = useState('');

  const params = { page, limit: 15, ...(search && { search }), ...(rating && { rating }), ...(visibility && { visibility }) };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-reviews', params],
    queryFn: async () => (await api.get<Paginated<AdminReview>>('/reviews/admin', { params })).data,
  });

  useEffect(() => {
    if (action?.type === 'reply') setReplyText(action.review.adminReply?.text ?? '');
  }, [action]);

  const mutation = useMutation({
    mutationFn: async ({ type, review, reason }: { type: 'hide' | 'show' | 'delete' | 'reply'; review: AdminReview; reason?: string }) => {
      if (type === 'delete') return api.delete(`/reviews/admin/${review._id}`);
      if (type === 'reply') return api.patch(`/reviews/admin/${review._id}/reply`, { text: replyText });
      return api.patch(`/reviews/admin/${review._id}/visibility`, { isHidden: type === 'hide', ...(reason ? { reason } : {}) });
    },
    onSuccess: (_res, { type }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      setAction(null);
      toast.success(
        type === 'delete' ? 'Review deleted' : type === 'reply' ? (replyText.trim() ? 'Reply published' : 'Reply removed') : type === 'hide' ? 'Review hidden' : 'Review visible again',
      );
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  return (
    <div>
      <AdminTitle title="Reviews" description="Only customers with a delivered order can review. Hidden reviews don’t count toward ratings." />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <SearchBox value={search} onChange={reset(setSearch)} placeholder="Text, perfume or customer..." />
        <FilterSelect label="Rating" value={rating} onChange={reset(setRating)} options={[{ value: '', label: 'All ratings' }, ...[5, 4, 3, 2, 1].map((r) => ({ value: String(r), label: `${r} star${r > 1 ? 's' : ''}` }))]} />
        <FilterSelect label="Visibility" value={visibility} onChange={reset(setVisibility)} options={[{ value: '', label: 'All' }, { value: 'visible', label: 'Visible' }, { value: 'hidden', label: 'Hidden' }]} />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorBox message={getErrorMessage(error)} />
      ) : data?.data.length === 0 ? (
        <p className="border border-navy/10 bg-white p-10 text-center text-sm text-navy/55">No reviews match these filters.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {data?.data.map((r) => (
              <li key={r._id} className={cn('border bg-white p-4 sm:p-5', r.isHidden ? 'border-navy/10 opacity-75' : 'border-navy/10 border-l-4 border-l-gold')}>
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Perfume */}
                  <div className="flex shrink-0 items-start gap-3 sm:w-56">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-surface">
                      {r.perfume?.images?.[0] && <Image src={r.perfume.images[0].url} alt="" fill sizes="48px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium">{r.perfume?.name ?? 'Deleted perfume'}</p>
                      {r.perfume && (
                        <a href={`/perfumes/${r.perfume.slug}#reviews`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-gold-dark hover:text-navy">
                          <ExternalLink size={12} /> View
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Review */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StarRating value={r.rating} size={16} />
                      {r.isHidden ? (
                        <span className="border border-navy/20 bg-navy/5 px-2 py-0.5 text-[10px] font-semibold uppercase text-navy/60">Hidden</span>
                      ) : (
                        <span className="border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-success">Visible</span>
                      )}
                    </div>
                    {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                    <p className="mt-1 whitespace-pre-line text-sm text-navy/80">{r.comment}</p>
                    <p className="mt-2 text-xs text-navy/55">
                      {r.user ? `${r.user.name} · ${r.user.email}` : 'Deleted user'} · {formatDate(r.createdAt, true)}
                    </p>
                    {r.isHidden && r.hiddenReason && <p className="mt-1 text-xs text-error">Hidden: {r.hiddenReason}</p>}
                    {r.adminReply && (
                      <div className="mt-3 border-l-4 border-gold bg-surface p-3 text-sm">
                        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gold-dark"><Store size={12} /> Your reply</p>
                        <p className="mt-1 whitespace-pre-line">{r.adminReply.text}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-navy/10 pt-3">
                  <Button size="sm" variant="outline" onClick={() => setAction({ type: 'reply', review: r })}>
                    <MessageSquareReply size={14} /> {r.adminReply ? 'Edit reply' : 'Reply'}
                  </Button>
                  {r.isHidden ? (
                    <Button size="sm" variant="gold" onClick={() => setAction({ type: 'show', review: r })}><Eye size={14} /> Show</Button>
                  ) : (
                    <Button size="sm" onClick={() => setAction({ type: 'hide', review: r })}><EyeOff size={14} /> Hide</Button>
                  )}
                  <button type="button" onClick={() => setAction({ type: 'delete', review: r })} aria-label="Delete review" className="ml-auto flex h-9 w-9 items-center justify-center text-navy/45 hover:text-error">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <AdminPagination meta={data?.meta} onPage={setPage} />
        </>
      )}

      <ConfirmDialog
        open={action?.type === 'hide'}
        title="Hide this review?"
        message="It will disappear from the product page and stop counting toward the rating."
        confirmLabel="Hide review"
        tone="primary"
        reason={{ label: 'Reason (internal)', placeholder: 'e.g. Spam, offensive language' }}
        loading={mutation.isPending}
        onClose={() => setAction(null)}
        onConfirm={(reason) => action && mutation.mutate({ type: 'hide', review: action.review, reason })}
      />
      <ConfirmDialog
        open={action?.type === 'show'}
        title="Show this review again?"
        message="It will be visible on the product page and count toward the rating."
        confirmLabel="Show review"
        tone="gold"
        loading={mutation.isPending}
        onClose={() => setAction(null)}
        onConfirm={() => action && mutation.mutate({ type: 'show', review: action.review })}
      />
      <ConfirmDialog
        open={action?.type === 'delete'}
        title="Delete this review permanently?"
        message="This cannot be undone. Consider hiding it instead."
        confirmLabel="Delete"
        tone="danger"
        loading={mutation.isPending}
        onClose={() => setAction(null)}
        onConfirm={() => action && mutation.mutate({ type: 'delete', review: action.review })}
      />

      <Modal
        open={action?.type === 'reply'}
        onClose={() => setAction(null)}
        title="Reply as the store"
        footer={
          <>
            <Button variant="outline" onClick={() => setAction(null)} disabled={mutation.isPending}>Cancel</Button>
            <Button variant="gold" loading={mutation.isPending} onClick={() => action && mutation.mutate({ type: 'reply', review: action.review })}>
              {replyText.trim() ? 'Publish reply' : 'Remove reply'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-navy/65">Your reply is shown publicly under the review. Leave it empty to remove an existing reply.</p>
        <textarea
          rows={5}
          maxLength={1000}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Thank you for your feedback..."
          className={cn(fieldClass, 'mt-4 py-3')}
        />
      </Modal>
    </div>
  );
}