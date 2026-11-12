'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CircleCheck, CircleX, ExternalLink, PackageCheck, Truck, TriangleAlert } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { PAYMENT_METHOD_LABELS } from '@/lib/labels';
import { cn, formatDate, formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/status-badge';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { AdminTitle, ConfirmDialog, ErrorBox, Panel } from './admin-ui';
import type { AdminOrder } from '@/types/admin';
import type { OrderStatus } from '@/types';

type Dialog = null | 'confirm' | 'reject' | OrderStatus;

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ['cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
};

/** tone = colour of BOTH the action-bar button and the confirm button in the dialog */
const STATUS_ACTION: Record<string, { label: string; icon: typeof Truck; tone: 'primary' | 'gold' | 'danger' }> = {
  shipped: { label: 'Mark as shipped', icon: Truck, tone: 'gold' },
  delivered: { label: 'Mark as delivered', icon: PackageCheck, tone: 'gold' },
  cancelled: { label: 'Cancel order', icon: CircleX, tone: 'danger' },
};

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<Dialog>(null);
  const key = ['admin-order', orderId];

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: key,
    queryFn: async () => (await api.get<AdminOrder>(`/orders/admin/${orderId}`)).data,
  });

  const onDone = (updated: AdminOrder, message: string) => {
    queryClient.setQueryData(key, updated);
    ['admin-orders', 'admin-payments', 'admin-dashboard'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
    setDialog(null);
    toast.success(message);
  };

  const mutation = useMutation({
    mutationFn: async ({ action, reason }: { action: Exclude<Dialog, null>; reason: string }) => {
      if (action === 'confirm') return (await api.patch<AdminOrder>(`/orders/admin/${orderId}/payment/confirm`)).data;
      if (action === 'reject') return (await api.patch<AdminOrder>(`/orders/admin/${orderId}/payment/reject`, { reason })).data;
      return (await api.patch<AdminOrder>(`/orders/admin/${orderId}/status`, { status: action, ...(reason ? { note: reason } : {}) })).data;
    },
    onSuccess: (updated, { action }) =>
      onDone(updated, action === 'confirm' ? 'Payment confirmed' : action === 'reject' ? 'Payment rejected' : `Order marked as ${action}`),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <PageLoader label="Loading order..." />;
  if (isError || !order) return <ErrorBox message={getErrorMessage(error, 'Order not found')} />;

  const canConfirm = order.orderStatus !== 'cancelled' && (order.paymentStatus === 'awaiting_confirmation' || order.paymentStatus === 'pending');
  const canReject = order.paymentStatus === 'awaiting_confirmation';
  const nextStatuses = NEXT_STATUS[order.orderStatus] ?? [];
  const refundRequired = order.orderStatus === 'cancelled' && order.paymentStatus === 'paid';
  const proofs = [...(order.paymentProofs ?? [])].reverse();

  const dialogConfig = (() => {
    if (dialog === 'confirm') return { title: 'Confirm payment', message: `Confirm that ${formatNaira(order.total)} has been received for ${order.orderNumber}? The order moves to processing.`, confirmLabel: 'Yes, confirm', tone: 'gold' as const };
    if (dialog === 'reject') return { title: 'Reject payment proof', message: 'The customer will see your reason and can upload a new proof or pay by card.', confirmLabel: 'Reject proof', tone: 'danger' as const, reason: { label: 'Reason', placeholder: 'e.g. Amount received was ₦50,000 not ₦95,000', required: true } };
    if (dialog) {
      const a = STATUS_ACTION[dialog];
      return {
        title: a.label,
        message: dialog === 'cancelled'
          ? `Cancel ${order.orderNumber}? Stock will be restored${order.paymentStatus === 'paid' ? ' and the order will be marked for refund — refund the customer manually.' : '.'}`
          : `Update ${order.orderNumber} to “${dialog}”?`,
        confirmLabel: a.label,
        tone: a.tone,
        reason: { label: dialog === 'cancelled' ? 'Reason' : 'Note', placeholder: dialog === 'shipped' ? 'e.g. Sent with GIG Logistics, tracking #123' : '' },
      };
    }
    return null;
  })();

  return (
    <div className="space-y-6">
      <AdminTitle
        title={<span className="font-mono">{order.orderNumber}</span>}
        description={`Placed ${formatDate(order.createdAt, true)}`}
        actions={
          <>
            <PaymentStatusBadge status={order.paymentStatus} />
            <OrderStatusBadge status={order.orderStatus} />
          </>
        }
      />

      {refundRequired && (
        <p className="flex items-center gap-3 border-l-4 border-error bg-error/10 p-4 text-sm font-medium text-error">
          <TriangleAlert size={18} /> This order was paid but is cancelled — refund the customer.
        </p>
      )}

      {/* Actions */}
      {(canConfirm || canReject || nextStatuses.length > 0) && (
        <div className="flex flex-col gap-2 border-t-4 border-gold bg-navy p-4 xs:flex-row xs:flex-wrap">
          {canConfirm && (
            <Button variant="gold" onClick={() => setDialog('confirm')}>
              <CircleCheck size={16} /> Confirm payment
            </Button>
          )}
          {canReject && (
            <Button variant="danger" onClick={() => setDialog('reject')}>
              <CircleX size={16} /> Reject proof
            </Button>
          )}
          {nextStatuses.map((s) => {
            const a = STATUS_ACTION[s];
            const Icon = a.icon;
            return (
              <Button key={s} variant={a.tone} onClick={() => setDialog(s)}>
                <Icon size={16} /> {a.label}
              </Button>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          {/* Proofs */}
          <Panel title={`Payment proofs (${proofs.length})`}>
            {proofs.length === 0 ? (
              <p className="text-sm text-navy/55">{order.paymentMethod === 'paystack' ? 'Paid via Paystack — no proof needed.' : 'No proof uploaded yet.'}</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {proofs.map((proof, i) => (
                  <li key={proof._id} className={cn('border p-3', i === 0 ? 'border-gold' : 'border-navy/10')}>
                    <a href={proof.image.url} target="_blank" rel="noopener noreferrer" className="group relative block aspect-[3/4] overflow-hidden bg-surface">
                      <Image src={proof.image.url} alt="Payment proof" fill sizes="(min-width: 640px) 300px, 90vw" className="object-contain" />
                      <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-navy px-2 py-1 text-[10px] font-semibold uppercase text-gold">
                        <ExternalLink size={12} /> Full size
                      </span>
                    </a>
                    <dl className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between gap-2"><dt className="text-navy/55">Status</dt><dd className="font-semibold capitalize">{proof.status}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-navy/55">Paid into</dt><dd className="text-right">{proof.bankAccount.bankName} · {proof.bankAccount.accountNumber}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-navy/55">Sender</dt><dd className="text-right font-medium">{proof.senderName}</dd></div>
                      {proof.amountPaid != null && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-navy/55">Amount</dt>
                          <dd className={cn('font-semibold', proof.amountPaid < order.total ? 'text-error' : 'text-success')}>{formatNaira(proof.amountPaid)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between gap-2"><dt className="text-navy/55">Uploaded</dt><dd>{formatDate(proof.uploadedAt, true)}</dd></div>
                      {proof.note && <p className="bg-surface p-2 text-xs">“{proof.note}”</p>}
                      {proof.rejectionReason && <p className="text-xs text-error">Rejected: {proof.rejectionReason}</p>}
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Items */}
          <Panel title="Items">
            <ul className="divide-y divide-navy/10">
              {order.items.map((item, i) => (
                <li key={`${item.variantId}-${i}`} className="flex gap-3 py-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-surface">
                    {item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 xs:flex-row">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">{item.brandName}</p>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-navy/55">{item.size}ml · {formatNaira(item.price)} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatNaira(item.subtotal)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Timeline">
            <OrderTimeline history={order.statusHistory} />
          </Panel>
        </div>

        <aside className="space-y-6">
          <div className="border-t-4 border-gold bg-navy p-5 text-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Totals</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-white/65">Subtotal</dt><dd>{formatNaira(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-white/65">Delivery</dt><dd>{order.shippingFee ? formatNaira(order.shippingFee) : 'Free'}</dd></div>
              <div className="flex justify-between border-t border-gold/30 pt-2 text-base"><dt>Total</dt><dd className="font-semibold text-gold">{formatNaira(order.total)}</dd></div>
            </dl>
          </div>

          <Panel title="Customer">
            {order.user ? (
              <div className="text-sm">
                <p className="font-semibold">{order.user.name}</p>
                <p className="break-all text-navy/65">{order.user.email}</p>
                {order.user.phone && <p className="text-navy/65">{order.user.phone}</p>}
                <Link href={`/admin/users/${order.user._id}`} className="mt-2 inline-block text-xs font-semibold uppercase text-gold-dark hover:text-navy">View customer</Link>
              </div>
            ) : (
              <p className="text-sm text-navy/55">Account deleted</p>
            )}
          </Panel>

          <Panel title="Delivery address">
            <address className="text-sm not-italic leading-relaxed">
              <span className="font-semibold">{order.shippingAddress.fullName}</span><br />
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state}<br />
              {order.shippingAddress.country ?? 'Nigeria'}<br />
              <a href={`tel:${order.shippingAddress.phone}`} className="font-medium text-gold-dark">{order.shippingAddress.phone}</a>
            </address>
            {order.note && <p className="mt-3 border-l-4 border-gold bg-gold/10 p-2 text-xs">Note: {order.note}</p>}
          </Panel>

          <Panel title="Payment">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2"><dt className="text-navy/55">Method</dt><dd>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-navy/55">Deadline</dt><dd>{formatDate(order.paymentDeadline, true)}</dd></div>
              {order.paidAt && <div className="flex justify-between gap-2"><dt className="text-navy/55">Paid</dt><dd>{formatDate(order.paidAt, true)}</dd></div>}
              {order.paymentChannel && <div className="flex justify-between gap-2"><dt className="text-navy/55">Channel</dt><dd className="capitalize">{order.paymentChannel}</dd></div>}
              {order.paidReference && <div className="flex justify-between gap-2"><dt className="text-navy/55">Reference</dt><dd className="break-all text-right font-mono text-xs">{order.paidReference}</dd></div>}
              {order.paymentReviewedBy && <div className="flex justify-between gap-2"><dt className="text-navy/55">Reviewed by</dt><dd>{order.paymentReviewedBy.name}</dd></div>}
            </dl>
          </Panel>
        </aside>
      </div>

      {dialogConfig && (
        <ConfirmDialog
          open={!!dialog}
          title={dialogConfig.title}
          message={dialogConfig.message}
          confirmLabel={dialogConfig.confirmLabel}
          tone={dialogConfig.tone}
          reason={'reason' in dialogConfig ? dialogConfig.reason : undefined}
          loading={mutation.isPending}
          onClose={() => setDialog(null)}
          onConfirm={(reason) => dialog && mutation.mutate({ action: dialog, reason })}
        />
      )}
    </div>
  );
}