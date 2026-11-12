'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api, getErrorMessage } from '@/lib/api';
import { Modal } from '@/components/admin/admin-ui';
import { Spinner } from '@/components/ui/spinner';
import { ReviewForm } from './review-form';
import type { ReviewEligibility } from '@/types/review';

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  perfumeId: string;
  perfumeName: string;
}

export function ReviewDialog({ open, onClose, perfumeId, perfumeName }: ReviewDialogProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['review-eligibility', perfumeId],
    enabled: open,
    queryFn: async () => (await api.get<ReviewEligibility>(`/reviews/eligibility/${perfumeId}`)).data,
  });

  const onSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['review-eligibility', perfumeId] });
    queryClient.invalidateQueries({ queryKey: ['reviews', perfumeId] });
    router.refresh();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={data?.hasReviewed ? 'Edit your review' : 'Rate this perfume'}>
      <p className="mb-5 font-serif text-lg">{perfumeName}</p>
      {isLoading ? (
        <div className="flex justify-center py-10 text-gold"><Spinner size="lg" /></div>
      ) : isError ? (
        <p className="text-sm text-error">{getErrorMessage(error)}</p>
      ) : data?.hasReviewed && data.review ? (
        <>
          {data.review.isHidden && (
            <p className="mb-4 border-l-4 border-gold bg-gold/10 p-3 text-xs">This review is currently hidden by the store.</p>
          )}
          <ReviewForm perfumeId={perfumeId} existing={data.review} onSaved={onSaved} onCancel={onClose} />
        </>
      ) : data?.canReview ? (
        <ReviewForm perfumeId={perfumeId} onSaved={onSaved} onCancel={onClose} />
      ) : (
        <p className="text-sm text-navy/65">{data?.reason ?? 'You can’t review this perfume yet.'}</p>
      )}
    </Modal>
  );
}