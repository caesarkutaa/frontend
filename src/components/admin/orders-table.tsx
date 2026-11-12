'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/labels';
import { formatDate, formatNaira } from '@/lib/utils';
import { PageLoader } from '@/components/ui/spinner';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/status-badge';
import { AdminPagination, AdminTitle, EmptyRow, ErrorBox, FilterSelect, SearchBox, TableHead, TableWrap, td } from './admin-ui';
import type { AdminOrder } from '@/types/admin';
import type { Paginated } from '@/types';

const toOptions = (labels: Record<string, string>, all: string) => [{ value: '', label: all }, ...Object.entries(labels).map(([value, label]) => ({ value, label }))];

export function OrdersTable({ initialOrderStatus = '', initialPaymentStatus = '' }: { initialOrderStatus?: string; initialPaymentStatus?: string }) {
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState(initialOrderStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [page, setPage] = useState(1);

  const params = { page, limit: 15, ...(search && { search }), ...(orderStatus && { orderStatus }), ...(paymentStatus && { paymentStatus }) };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-orders', params],
    queryFn: async () => (await api.get<Paginated<AdminOrder>>('/orders/admin', { params })).data,
  });

  const update = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <div>
      <AdminTitle title="Orders" description="Search by order number, customer name, email or phone." />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <SearchBox value={search} onChange={(v) => update(() => setSearch(v))} placeholder="Search orders..." />
        <FilterSelect label="Order status" value={orderStatus} onChange={(v) => update(() => setOrderStatus(v))} options={toOptions(ORDER_STATUS_LABELS, 'All order statuses')} />
        <FilterSelect label="Payment status" value={paymentStatus} onChange={(v) => update(() => setPaymentStatus(v))} options={toOptions(PAYMENT_STATUS_LABELS, 'All payment statuses')} />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorBox message={getErrorMessage(error)} />
      ) : (
        <>
          <TableWrap>
            <TableHead columns={['Order', 'Customer', 'Date', 'Items', 'Total', 'Method', 'Payment', 'Status', '']} />
            <tbody className="divide-y divide-navy/10">
              {data?.data.length === 0 && <EmptyRow colSpan={9} message="No orders match these filters" />}
              {data?.data.map((o) => (
                <tr key={o._id} className="hover:bg-surface">
                  <td className={`${td} font-mono font-semibold`}>{o.orderNumber}</td>
                  <td className={td}>
                    <p className="font-medium">{o.user?.name ?? o.shippingAddress.fullName}</p>
                    <p className="text-xs text-navy/55">{o.user?.email}</p>
                  </td>
                  <td className={`${td} whitespace-nowrap text-navy/60`}>{formatDate(o.createdAt, true)}</td>
                  <td className={td}>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className={`${td} font-semibold`}>{formatNaira(o.total)}</td>
                  <td className={`${td} whitespace-nowrap`}>{PAYMENT_METHOD_LABELS[o.paymentMethod]}</td>
                  <td className={td}><PaymentStatusBadge status={o.paymentStatus} /></td>
                  <td className={td}><OrderStatusBadge status={o.orderStatus} /></td>
                  <td className={td}>
                    <Link href={`/admin/orders/${o._id}`} className="whitespace-nowrap bg-navy px-3 py-1.5 text-xs font-semibold uppercase text-gold hover:bg-gold hover:text-navy">
                      {o.paymentStatus === 'awaiting_confirmation' ? 'Review' : 'Open'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <AdminPagination meta={data?.meta} onPage={setPage} />
        </>
      )}
    </div>
  );
}