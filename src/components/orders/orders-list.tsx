'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { ORDERS_PAGE_SIZE } from '@/lib/constants';
import { cn, formatDate, formatNaira } from '@/lib/utils';
import { buttonClasses } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { PageLoader } from '@/components/ui/spinner';
import { OrderStatusBadge, PaymentStatusBadge } from './status-badge';
import type { Order, Paginated } from '@/types';

const TABS = [
  { key: 'all', label: 'All', params: {} },
  { key: 'awaiting', label: 'Awaiting payment', params: { paymentStatus: 'pending' } },
  { key: 'rejected', label: 'Payment rejected', params: { paymentStatus: 'rejected' } },
  { key: 'review', label: 'Under review', params: { paymentStatus: 'awaiting_confirmation' } },
  { key: 'processing', label: 'Processing', params: { orderStatus: 'processing' } },
  { key: 'shipped', label: 'Shipped', params: { orderStatus: 'shipped' } },
  { key: 'delivered', label: 'Delivered', params: { orderStatus: 'delivered' } },
  { key: 'cancelled', label: 'Cancelled', params: { orderStatus: 'cancelled' } },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export const isOrderPayable = (order: Pick<Order, 'orderStatus' | 'paymentStatus'>) =>
  order.orderStatus === 'pending' &&
  (order.paymentStatus === 'pending' || order.paymentStatus === 'rejected');

export function OrdersList() {
  const [tab, setTab] = useState<TabKey>('all');
  const [page, setPage] = useState(1);
  const activeTab = TABS.find((t) => t.key === tab)!;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orders', tab, page],
    queryFn: async () =>
      (
        await api.get<Paginated<Order>>('/orders', {
          params: { page, limit: ORDERS_PAGE_SIZE, ...activeTab.params },
        })
      ).data,
  });

  const changeTab = (key: TabKey) => {
    setTab(key);
    setPage(1);
  };

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="pb-16 sm:pb-24">
      <PageHeader eyebrow="Your account" title="My Orders" description="Track payments and deliveries." />

      <div className="container-page pt-6 sm:pt-8">
        {/* Tabs — scroll on small screens */}
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-2 border-b border-navy/10 pb-3">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => changeTab(t.key)}
                className={cn(
                  'h-10 whitespace-nowrap px-4 text-xs font-semibold uppercase tracking-wider transition-colors',
                  tab === t.key ? 'bg-navy text-gold' : 'border border-navy/15 text-navy hover:border-gold',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <PageLoader label="Loading your orders..." />
          ) : isError ? (
            <p className="border border-error/30 bg-error/10 p-6 text-center text-sm text-error">
              {getErrorMessage(error, 'Could not load your orders')}
            </p>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center border-t-4 border-gold bg-surface px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center bg-navy text-gold">
                <Package size={26} />
              </span>
              <p className="mt-4 font-serif text-2xl">No orders here yet</p>
              <p className="mt-2 text-sm text-navy/60">
                {tab === 'all' ? 'When you place an order, it will appear here.' : 'No orders match this filter.'}
              </p>
              <Link href="/perfumes" className={buttonClasses({ className: 'mt-6' })}>
                Shop perfumes
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </ul>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between gap-3 sm:justify-center">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-11 items-center gap-1 border border-navy px-4 text-xs font-semibold uppercase tracking-wider hover:bg-navy hover:text-gold disabled:opacity-30"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-sm">
                Page <span className="font-bold">{meta.page}</span> of {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-11 items-center gap-1 border border-navy px-4 text-xs font-semibold uppercase tracking-wider hover:bg-navy hover:text-gold disabled:opacity-30"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const payable = isOrderPayable(order);
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const thumbs = order.items.slice(0, 4);
  const extra = order.items.length - thumbs.length;

  return (
    <li className="border border-navy/10 transition-colors hover:border-gold">
      <div className="flex flex-col gap-3 border-b border-navy/10 bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
          <p className="text-xs text-navy/55">Placed {formatDate(order.createdAt, true)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PaymentStatusBadge status={order.paymentStatus} />
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-2">
          {thumbs.map((item, i) => (
            <div key={`${item.variantId}-${i}`} className="relative h-14 w-12 shrink-0 overflow-hidden border border-navy/10 bg-surface sm:h-16 sm:w-14">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center font-serif italic text-gold-dark">
                  {item.name.charAt(0)}
                </span>
              )}
            </div>
          ))}
          {extra > 0 && (
            <span className="flex h-14 w-12 items-center justify-center bg-navy text-xs font-bold text-gold sm:h-16 sm:w-14">
              +{extra}
            </span>
          )}
          <div className="ml-2 min-w-0 sm:ml-4">
            <p className="text-sm text-navy/60">
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </p>
            <p className="text-lg font-semibold">{formatNaira(order.total)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 xs:flex-row">
          {payable && (
            <Link href={`/orders/${order._id}/payment`} className={buttonClasses({ variant: 'gold', size: 'sm' })}>
              Pay now
            </Link>
          )}
          <Link href={`/orders/${order._id}`} className={buttonClasses({ variant: 'outline', size: 'sm' })}>
            View details
          </Link>
        </div>
      </div>
    </li>
  );
}