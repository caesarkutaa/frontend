'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  CircleCheck,
  CircleX,
  Clock,
  Hourglass,
  PackageCheck,
  PackageX,
  Star,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { PAYMENT_METHOD_LABELS } from '@/lib/labels';
import { cn, formatDate, formatNaira } from '@/lib/utils';
import { Button, buttonClasses } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { PageLoader } from '@/components/ui/spinner';
import { StateMessage } from '@/components/ui/state-message';
import { ReviewDialog } from '@/components/reviews/review-dialog';
import { Countdown } from './countdown';
import { OrderStatusBadge, PaymentStatusBadge } from './status-badge';
import { OrderTimeline } from './order-timeline';
import { isOrderPayable } from './orders-list';
import type { Order } from '@/types';

export function OrderDetail({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [reason, setReason] = useState('');
  const [rating, setRating] = useState<{ perfumeId: string; name: string } | null>(null);

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => (await api.get<Order>(`/orders/${orderId}`)).data,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => (await api.patch<Order>(`/orders/${orderId}/cancel`, reason.trim() ? { reason: reason.trim() } : {})).data,
    onSuccess: (updated) => {
      queryClient.setQueryData(['order', orderId], updated);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setConfirmCancel(false);
      toast.success('Your order has been cancelled');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not cancel this order')),
  });

  if (isLoading) return <PageLoader label="Loading order..." />;

  if (isError || !order) {
    return (
      <StateMessage icon={PackageX} tone="error" title="Order not found" description={getErrorMessage(error, 'We could not find this order.')}>
        <Link href="/orders" className={buttonClasses({ size: 'lg' })}>My orders</Link>
      </StateMessage>
    );
  }

  const payable = isOrderPayable(order);
  const delivered = order.orderStatus === 'delivered';

  return (
    <div className="pb-16 sm:pb-24">
      <PageHeader
        eyebrow={`Placed ${formatDate(order.createdAt, true)}`}
        title={<span className="font-mono">{order.orderNumber}</span>}
        backHref="/orders"
        backLabel="My orders"
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <PaymentStatusBadge status={order.paymentStatus} />
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </PageHeader>

      <div className="container-page pt-6 sm:pt-8">
        <StatusBanner order={order} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-10 xl:grid-cols-[1fr_400px]">
          <div className="min-w-0 space-y-8">
            {/* Items */}
            <section>
              <h2 className="text-xl font-medium sm:text-2xl">Items</h2>
              {delivered && <p className="mt-1 text-sm text-navy/60">Enjoying your fragrance? Leave a review to help other shoppers.</p>}
              <ul className="mt-4 divide-y divide-navy/10 border-y border-navy/10">
                {order.items.map((item, i) => (
                  <li key={`${item.variantId}-${i}`} className="flex gap-4 py-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden border border-navy/10 bg-surface sm:h-24 sm:w-20">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center font-serif text-xl italic text-gold-dark">{item.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 xs:flex-row xs:items-start">
                      <div className="min-w-0">
                        {item.brandName && (
                          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark sm:text-xs">{item.brandName}</p>
                        )}
                        <p className="font-serif text-base sm:text-lg">{item.name}</p>
                        <p className="text-xs text-navy/55 sm:text-sm">
                          {item.size}ml · {formatNaira(item.price)} × {item.quantity}
                        </p>
                        {delivered && (
                          <button
                            type="button"
                            onClick={() => setRating({ perfumeId: item.perfume, name: item.name })}
                            className="mt-2 inline-flex items-center gap-1.5 bg-gold px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-navy hover:bg-navy hover:text-gold"
                          >
                            <Star size={12} fill="currentColor" /> Rate this perfume
                          </button>
                        )}
                      </div>
                      <p className="font-semibold">{formatNaira(item.subtotal)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Payment proofs */}
            {!!order.paymentProofs?.length && (
              <section>
                <h2 className="text-xl font-medium sm:text-2xl">Payment proofs</h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {[...order.paymentProofs].reverse().map((proof) => (
                    <li key={proof._id} className="flex gap-3 border border-navy/10 p-3">
                      <a href={proof.image.url} target="_blank" rel="noopener noreferrer" className="relative h-24 w-20 shrink-0 overflow-hidden border border-gold/50 bg-surface">
                        <Image src={proof.image.url} alt="Payment proof" fill sizes="80px" className="object-cover" />
                      </a>
                      <div className="min-w-0 text-sm">
                        <span
                          className={cn(
                            'inline-block border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                            proof.status === 'approved' && 'border-success/40 bg-success/10 text-success',
                            proof.status === 'rejected' && 'border-error/40 bg-error/10 text-error',
                            proof.status === 'pending' && 'border-navy bg-navy text-gold',
                          )}
                        >
                          {proof.status === 'pending' ? 'Under review' : proof.status}
                        </span>
                        <p className="mt-1.5 truncate font-medium">{proof.bankAccount.bankName}</p>
                        <p className="truncate text-xs text-navy/60">From {proof.senderName}</p>
                        {proof.amountPaid != null && <p className="text-xs text-navy/60">{formatNaira(proof.amountPaid)}</p>}
                        <p className="text-xs text-navy/45">{formatDate(proof.uploadedAt, true)}</p>
                        {proof.rejectionReason && <p className="mt-1 text-xs text-error">{proof.rejectionReason}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className="text-xl font-medium sm:text-2xl">Order timeline</h2>
              <div className="mt-5">
                <OrderTimeline history={order.statusHistory} />
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-32 lg:h-fit">
            <div className="border-t-4 border-gold bg-navy p-5 text-white sm:p-6">
              <h2 className="text-lg font-medium text-gold">Summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-white/65">Subtotal</dt><dd>{formatNaira(order.subtotal)}</dd></div>
                <div className="flex justify-between">
                  <dt className="text-white/65">Delivery</dt>
                  <dd className="font-semibold text-gold">{order.shippingFee ? formatNaira(order.shippingFee) : 'Free'}</dd>
                </div>
                <div className="flex justify-between border-t border-gold/30 pt-3 text-base">
                  <dt className="font-medium">Total</dt>
                  <dd className="text-lg font-semibold text-gold">{formatNaira(order.total)}</dd>
                </div>
              </dl>
              {payable && (
                <Link href={`/orders/${order._id}/payment`} className={buttonClasses({ variant: 'gold', fullWidth: true, className: 'mt-5' })}>
                  Pay now
                </Link>
              )}
            </div>

            <div className="border border-navy/10 p-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">Delivery address</h3>
              <address className="mt-3 text-sm not-italic leading-relaxed">
                <span className="font-semibold">{order.shippingAddress.fullName}</span>
                <br />
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}
                <br />
                {order.shippingAddress.country ?? 'Nigeria'}
                <br />
                <span className="text-navy/65">{order.shippingAddress.phone}</span>
              </address>
            </div>

            <div className="border border-navy/10 p-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">Payment</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-navy/55">Method</dt><dd className="text-right font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</dd></div>
                {order.paidAt && <div className="flex justify-between gap-3"><dt className="text-navy/55">Paid on</dt><dd className="text-right font-medium">{formatDate(order.paidAt, true)}</dd></div>}
                {order.paymentChannel && (
                  <div className="flex justify-between gap-3"><dt className="text-navy/55">Channel</dt><dd className="text-right font-medium capitalize">{order.paymentChannel.replace(/_/g, ' ')}</dd></div>
                )}
                {order.paidReference && (
                  <div className="flex justify-between gap-3"><dt className="text-navy/55">Reference</dt><dd className="break-all text-right font-mono text-xs">{order.paidReference}</dd></div>
                )}
              </dl>
            </div>

            {payable && (
              <div className="border border-navy/10 p-5">
                {!confirmCancel ? (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    className="w-full text-center text-xs font-semibold uppercase tracking-wider text-navy/60 underline underline-offset-4 hover:text-error"
                  >
                    Cancel this order
                  </button>
                ) : (
                  <div>
                    <p className="text-sm font-semibold">Cancel this order?</p>
                    <p className="mt-1 text-xs text-navy/60">The items will be released back to stock.</p>
                    <textarea
                      rows={2}
                      maxLength={300}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason (optional)"
                      className="mt-3 w-full border border-navy/20 px-3 py-2 text-sm outline-none placeholder:text-navy/35 focus:border-gold"
                    />
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => setConfirmCancel(false)}>Keep order</Button>
                      <Button variant="danger" size="sm" loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>Yes, cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      {rating && (
        <ReviewDialog open={!!rating} onClose={() => setRating(null)} perfumeId={rating.perfumeId} perfumeName={rating.name} />
      )}
    </div>
  );
}

/* ---------- Status banner ---------- */
function StatusBanner({ order }: { order: Order }) {
  const banner = getBanner(order);
  if (!banner) return null;
  const { icon: Icon, tone, title, text, action } = banner;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-l-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5',
        tone === 'gold' && 'border-gold bg-gold/15',
        tone === 'navy' && 'border-gold bg-navy text-white',
        tone === 'success' && 'border-success bg-success/10',
        tone === 'error' && 'border-error bg-error/10',
      )}
    >
      <div className="flex gap-3">
        <Icon
          size={24}
          className={cn(
            'mt-0.5 shrink-0',
            tone === 'gold' && 'text-gold-dark',
            tone === 'navy' && 'text-gold',
            tone === 'success' && 'text-success',
            tone === 'error' && 'text-error',
          )}
        />
        <div>
          <p className="font-semibold">{title}</p>
          <div className={cn('mt-0.5 text-sm', tone === 'navy' ? 'text-white/75' : 'text-navy/70')}>{text}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

function getBanner(order: Order):
  | { icon: LucideIcon; tone: 'gold' | 'navy' | 'success' | 'error'; title: string; text: React.ReactNode; action?: React.ReactNode }
  | null {
  const payLink = (
    <Link href={`/orders/${order._id}/payment`} className={buttonClasses({ variant: 'primary', size: 'sm', className: 'shrink-0' })}>
      Pay now
    </Link>
  );

  if (order.orderStatus === 'cancelled') {
    return {
      icon: CircleX,
      tone: 'error',
      title: order.paymentStatus === 'refunded' ? 'Order cancelled — refund in progress' : 'Order cancelled',
      text: order.cancelReason ?? 'This order was cancelled.',
    };
  }
  if (order.paymentStatus === 'rejected') {
    return {
      icon: CircleX,
      tone: 'error',
      title: 'Payment proof not accepted',
      text: (
        <>
          {order.paymentRejectionReason && <>Reason: {order.paymentRejectionReason}. </>}
          Please pay again before <Countdown deadline={order.paymentDeadline} /> runs out.
        </>
      ),
      action: payLink,
    };
  }
  if (order.paymentStatus === 'pending') {
    return {
      icon: Clock,
      tone: 'gold',
      title: 'Awaiting your payment',
      text: <>Complete payment to secure your items. Time left: <Countdown deadline={order.paymentDeadline} /></>,
      action: payLink,
    };
  }
  if (order.paymentStatus === 'awaiting_confirmation') {
    return { icon: Hourglass, tone: 'navy', title: 'Payment under review', text: 'We received your payment proof and are confirming it.' };
  }
  if (order.orderStatus === 'processing') {
    return { icon: CircleCheck, tone: 'success', title: 'Payment confirmed', text: 'We are preparing your order for delivery.' };
  }
  if (order.orderStatus === 'shipped') {
    return { icon: Truck, tone: 'navy', title: 'Your order is on its way', text: order.shippedAt ? `Shipped ${formatDate(order.shippedAt, true)}` : 'It will arrive soon.' };
  }
  if (order.orderStatus === 'delivered') {
    return {
      icon: PackageCheck,
      tone: 'success',
      title: 'Delivered',
      text: order.deliveredAt ? `Delivered ${formatDate(order.deliveredAt, true)}. Enjoy your fragrance!` : 'Enjoy your fragrance!',
    };
  }
  return null;
}