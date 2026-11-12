'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, CircleX, Hourglass } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { buttonClasses } from '@/components/ui/button';
import { StateMessage } from '@/components/ui/state-message';
import { Spinner } from '@/components/ui/spinner';
import type { PaystackVerifyResult } from '@/types/checkout';

const MAX_CHECKS = 6; // ~18 seconds of re-checking

export function PaystackVerify({ orderId, reference }: { orderId: string; reference?: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['paystack-verify', reference],
    enabled: !!reference,
    retry: false,
    queryFn: async () =>
      (await api.get<PaystackVerifyResult>('/orders/paystack/verify', { params: { reference } })).data,
    // Webhook may arrive a few seconds later — keep checking
    refetchInterval: (q) =>
      q.state.data?.paid || q.state.dataUpdateCount >= MAX_CHECKS ? false : 3000,
  });

  const paid = query.data?.paid;

  useEffect(() => {
    if (!paid) return;
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    queryClient.invalidateQueries({ queryKey: ['order-payment', orderId] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  }, [paid, orderId, queryClient]);

  if (!reference) {
    return (
      <StateMessage icon={CircleX} tone="error" title="Missing payment reference">
        <Link href={`/orders/${orderId}`} className={buttonClasses({ size: 'lg' })}>
          View order
        </Link>
      </StateMessage>
    );
  }

  if (query.isError) {
    return (
      <StateMessage
        icon={CircleX}
        tone="error"
        title="We couldn’t verify this payment"
        description={getErrorMessage(query.error)}
      >
        <Link href={`/orders/${orderId}`} className={buttonClasses({ size: 'lg' })}>
          View order
        </Link>
      </StateMessage>
    );
  }

  if (paid) {
    return (
      <StateMessage
        icon={CircleCheck}
        tone="success"
        title="Payment successful"
        description={`Thank you! Order ${query.data?.orderNumber} is confirmed and will be prepared for delivery.`}
      >
        <Link href={`/orders/${orderId}`} className={buttonClasses({ size: 'lg' })}>
          View order
        </Link>
        <Link href="/perfumes" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
          Continue shopping
        </Link>
      </StateMessage>
    );
  }

  const stillChecking = query.isLoading || query.dataUpdateCount < MAX_CHECKS;

  if (stillChecking) {
    return (
      <div className="container-page flex flex-col items-center py-20 text-center sm:py-28">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-navy text-gold">
          <Spinner size="lg" />
        </span>
        <h1 className="mt-6 text-2xl font-medium sm:text-3xl">Confirming your payment…</h1>
        <div className="mx-auto mt-3 h-0.5 w-14 bg-gold" />
        <p className="mt-4 max-w-md text-sm text-navy/65">
          Please don’t close this page. This usually takes a few seconds.
        </p>
      </div>
    );
  }

  return (
    <StateMessage
      icon={Hourglass}
      tone="gold"
      title="Payment not confirmed yet"
      description="If money left your account, it will be confirmed automatically within a few minutes. Otherwise, you can try paying again."
    >
      <Link href={`/orders/${orderId}`} className={buttonClasses({ size: 'lg' })}>
        View order
      </Link>
      <Link href={`/orders/${orderId}/payment`} className={buttonClasses({ variant: 'gold', size: 'lg' })}>
        Try again
      </Link>
    </StateMessage>
  );
}