import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { OrderStatus, PaymentStatus } from '@/types';

const base =
  'inline-flex items-center whitespace-nowrap border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs';

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: 'border-gold bg-gold/15 text-gold-dark',
  awaiting_confirmation: 'border-navy bg-navy text-gold',
  paid: 'border-success/40 bg-success/10 text-success',
  rejected: 'border-error/40 bg-error/10 text-error',
  refunded: 'border-navy/20 bg-navy/5 text-navy/70',
};

const ORDER_STYLES: Record<OrderStatus, string> = {
  pending: 'border-gold bg-gold/15 text-gold-dark',
  processing: 'border-navy/30 bg-navy/5 text-navy',
  shipped: 'border-navy bg-navy text-white',
  delivered: 'border-success/40 bg-success/10 text-success',
  cancelled: 'border-error/40 bg-error/10 text-error',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={cn(base, PAYMENT_STYLES[status])}>{PAYMENT_STATUS_LABELS[status]}</span>;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cn(base, ORDER_STYLES[status])}>{ORDER_STATUS_LABELS[status]}</span>;
}