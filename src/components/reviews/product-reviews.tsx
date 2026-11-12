'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BadgeCheck, ChevronLeft, ChevronRight, MessageSquareQuote, Pencil, Store, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { Button, buttonClasses } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ConfirmDialog } from '@/components/admin/admin-ui';
import { StarRating } from './star-rating';
import { ReviewForm } from './review-form';
import type { ReviewEligibility, ReviewsResponse } from '@/types/review';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
];

export function ProductReviews({ perfumeId, slug }: { perfumeId: string; slug: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reviewsQuery = useQuery({
    queryKey: ['reviews', perfumeId, sort, page, ratingFilter],
    queryFn: async () =>
      (
        await api.get<ReviewsResponse>(`/reviews/perfume/${perfumeId}`, {
          params: { sort, page, limit: 5, ...(ratingFilter ? { rating: ratingFilter } : {}) },
        })
      ).data,
  });

  const eligibilityQuery = useQuery({
    queryKey: ['review-eligibility', perfumeId],
    enabled: status === 'authenticated',
    queryFn: async () => (await api.get<ReviewEligibility>(`/reviews/eligibility/${perfumeId}`)).data,
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['reviews', perfumeId] });
    queryClient.invalidateQueries({ queryKey: ['review-eligibility', perfumeId] });
    router.refresh(); // updates the star summary at the top of the page
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/reviews/${id}`),
    onSuccess: () => {
      setConfirmDelete(false);
      toast.success('Your review was deleted');
      refreshAll();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const summary = reviewsQuery.data?.summary;
  const reviews = reviewsQuery.data?.data ?? [];
  const meta = reviewsQuery.data?.meta;
  const eligibility = eligibilityQuery.data;
  const myReview = eligibility?.review;

  const pickRating = (r: number) => {
    setRatingFilter((cur) => (cur === r ? null : r));
    setPage(1);
  };

  return (
    <section id="reviews" className="mt-14 scroll-mt-32 border-t border-navy/10 pt-10 sm:mt-20">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">Verified buyers</p>
      <h2 className="mt-2 text-2xl font-medium sm:text-3xl">Customer reviews</h2>
      <div className="mt-3 h-0.5 w-14 bg-gold" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-12">
        {/* ===== Summary ===== */}
        <aside className="h-fit space-y-5 lg:sticky lg:top-32">
          <div className="border-t-4 border-gold bg-navy p-6 text-white">
            <div className="flex items-end gap-3">
              <span className="font-serif text-5xl text-gold">{summary ? summary.average.toFixed(1) : '–'}</span>
              <span className="pb-2 text-sm text-white/65">out of 5</span>
            </div>
            <StarRating value={summary?.average ?? 0} size={20} className="mt-2" />
            <p className="mt-2 text-sm text-white/70">
              Based on {summary?.count ?? 0} review{summary?.count === 1 ? '' : 's'}
            </p>

            <ul className="mt-5 space-y-2">
              {[5, 4, 3, 2, 1].map((r) => {
                const count = summary?.breakdown[r] ?? 0;
                const pct = summary?.count ? (count / summary.count) * 100 : 0;
                return (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => pickRating(r)}
                      disabled={!count}
                      className={cn('flex w-full items-center gap-3 text-sm disabled:opacity-40', ratingFilter === r && 'text-gold')}
                    >
                      <span className="w-6 text-left">{r}★</span>
                      <span className="h-2 flex-1 bg-white/10">
                        <span className="block h-2 bg-gold" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-8 text-right text-white/70">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {ratingFilter && (
              <button type="button" onClick={() => pickRating(ratingFilter)} className="mt-3 text-xs font-semibold uppercase text-gold underline">
                Show all ratings
              </button>
            )}
          </div>

          {/* Who can review */}
          <div className="border border-navy/10 bg-surface p-5 text-sm">
            {status !== 'authenticated' ? (
              <>
                <p className="text-navy/70">Bought this perfume? Log in to share your experience.</p>
                <Link href={`/login?redirect=/perfumes/${slug}%23reviews`} className={buttonClasses({ size: 'sm', className: 'mt-3' })}>
                  Log in to review
                </Link>
              </>
            ) : eligibilityQuery.isLoading ? (
              <Spinner className="text-gold" />
            ) : myReview ? (
              <>
                <p className="font-semibold">You reviewed this perfume</p>
                <StarRating value={myReview.rating} className="mt-1" />
                {myReview.isHidden && <p className="mt-2 text-xs text-error">Hidden by the store</p>}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setWriting(true)}><Pencil size={14} /> Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 size={14} /> Delete</Button>
                </div>
              </>
            ) : eligibility?.canReview ? (
              <>
                <p className="text-navy/70">You received this perfume — tell others what you think!</p>
                <Button size="sm" variant="gold" className="mt-3" onClick={() => setWriting(true)}>Write a review</Button>
              </>
            ) : (
              <p className="text-navy/65">{eligibility?.reason ?? 'Only verified buyers can review.'}</p>
            )}
          </div>
        </aside>

        {/* ===== List ===== */}
        <div className="min-w-0">
          {writing && (
            <div className="mb-8 border-t-4 border-gold bg-surface p-5 sm:p-6">
              <h3 className="mb-4 text-xl font-medium">{myReview ? 'Edit your review' : 'Write a review'}</h3>
              <ReviewForm
                perfumeId={perfumeId}
                existing={myReview}
                onSaved={() => {
                  setWriting(false);
                  refreshAll();
                }}
                onCancel={() => setWriting(false)}
              />
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-navy/60">
              {meta?.total ?? 0} review{meta?.total === 1 ? '' : 's'}
              {ratingFilter ? ` with ${ratingFilter} stars` : ''}
            </p>
            <select
              aria-label="Sort reviews"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="h-10 border border-navy/20 bg-white px-3 text-sm outline-none focus:border-gold"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {reviewsQuery.isLoading ? (
            <div className="flex justify-center py-12 text-gold"><Spinner size="lg" /></div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center border border-navy/10 px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center bg-navy text-gold"><MessageSquareQuote size={22} /></span>
              <p className="mt-4 font-serif text-xl">No reviews yet</p>
              <p className="mt-1 text-sm text-navy/60">Be the first verified buyer to review this perfume.</p>
            </div>
          ) : (
            <ul className="divide-y divide-navy/10 border-y border-navy/10">
              {reviews.map((r) => (
                <li key={r._id} className="py-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StarRating value={r.rating} size={16} />
                    <span className="text-xs text-navy/50">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy/80">{r.comment}</p>
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold">{r.authorName}</span>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 bg-gold/15 px-2 py-0.5 font-semibold text-gold-dark">
                        <BadgeCheck size={12} /> Verified buyer
                      </span>
                    )}
                  </p>
                  {r.adminReply && (
                    <div className="mt-4 border-l-4 border-gold bg-surface p-3 text-sm">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-dark">
                        <Store size={12} /> Response from the store
                      </p>
                      <p className="mt-1 whitespace-pre-line text-navy/80">{r.adminReply.text}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous reviews"
                className="flex h-10 w-10 items-center justify-center border border-navy hover:bg-navy hover:text-gold disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm"><span className="font-bold">{page}</span> / {meta.totalPages}</span>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next reviews"
                className="flex h-10 w-10 items-center justify-center border border-navy hover:bg-navy hover:text-gold disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your review?"
        message="Your rating and review will be removed from this perfume."
        confirmLabel="Delete"
        tone="danger"
        loading={deleteMutation.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => myReview && deleteMutation.mutate(myReview._id)}
      />
    </section>
  );
}