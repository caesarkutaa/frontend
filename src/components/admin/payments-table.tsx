'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/labels';
import { cn, formatDate, formatNaira } from '@/lib/utils';
import { PageLoader } from '@/components/ui/spinner';
import { PaymentStatusBadge } from '@/components/orders/status-badge';
import { AdminPagination, AdminTitle, EmptyRow, ErrorBox, FilterSelect, SearchBox, TableHead, TableWrap, td } from './admin-ui';
import type { AdminPaymentsResponse } from '@/types/admin';
import type { PaymentStatus } from '@/types';

const STATUSES = Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[];

export function PaymentsTable({ initialStatus = '' }: { initialStatus?: string }) {
  const [paymentStatus, setPaymentStatus] = useState(initialStatus);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const params = { page, limit: 15, ...(paymentStatus && { paymentStatus }), ...(paymentMethod && { paymentMethod }), ...(search && { search }) };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-payments', params],
    queryFn: async () => (await api.get<AdminPaymentsResponse>('/admin/payments', { params })).data,
  });

  const pick = (status: string) => {
    setPaymentStatus((s) => (s === status ? '' : status));
    setPage(1);
  };

  return (
    <div>
      <AdminTitle title="Payments" description="Tap a status to filter. Under review = bank transfer proofs waiting for you." />

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {STATUSES.map((status) => {
          const s = data?.summary?.[status];
          const active = paymentStatus === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => pick(status)}
              className={cn('p-4 text-left transition-colors', active ? 'bg-navy text-white' : 'border border-navy/10 bg-white hover:border-gold')}
            >
              <p className={cn('text-[11px] font-bold uppercase tracking-wider', active ? 'text-gold' : 'text-navy/55')}>{PAYMENT_STATUS_LABELS[status]}</p>
              <p className="mt-1 text-2xl font-semibold">{s?.count ?? '—'}</p>
              <p className={cn('text-xs', active ? 'text-white/65' : 'text-navy/55')}>{s ? formatNaira(s.amount) : ''}</p>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Order #, reference, sender, customer..." />
        <FilterSelect
          label="Method"
          value={paymentMethod}
          onChange={(v) => { setPaymentMethod(v); setPage(1); }}
          options={[{ value: '', label: 'All methods' }, ...Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label }))]}
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorBox message={getErrorMessage(error)} />
      ) : (
        <>
          <TableWrap>
            <TableHead columns={['Order', 'Customer', 'Amount', 'Method', 'Status', 'Proof', 'Paid / Ref', '']} />
            <tbody className="divide-y divide-navy/10">
              {data?.data.length === 0 && <EmptyRow colSpan={8} message="No payments match these filters" />}
              {data?.data.map((o) => {
                const proof = o.paymentProofs?.[o.paymentProofs.length - 1];
                return (
                  <tr key={o._id} className="hover:bg-surface">
                    <td className={td}>
                      <p className="font-mono font-semibold">{o.orderNumber}</p>
                      <p className="text-xs text-navy/55">{formatDate(o.createdAt, true)}</p>
                    </td>
                    <td className={td}>
                      <p className="font-medium">{o.user?.name ?? '—'}</p>
                      <p className="text-xs text-navy/55">{o.user?.email}</p>
                    </td>
                    <td className={`${td} font-semibold`}>{formatNaira(o.total)}</td>
                    <td className={`${td} whitespace-nowrap`}>{PAYMENT_METHOD_LABELS[o.paymentMethod]}</td>
                    <td className={td}><PaymentStatusBadge status={o.paymentStatus} /></td>
                    <td className={td}>
                      {proof ? (
                        <a href={proof.image.url} target="_blank" rel="noopener noreferrer" className="relative block h-12 w-10 overflow-hidden border border-gold">
                          <Image src={proof.image.url} alt="Proof" fill sizes="40px" className="object-cover" />
                        </a>
                      ) : (
                        <span className="text-xs text-navy/40">—</span>
                      )}
                    </td>
                    <td className={td}>
                      {o.paidAt ? <p className="whitespace-nowrap text-xs">{formatDate(o.paidAt, true)}</p> : <p className="text-xs text-navy/40">Not paid</p>}
                      {o.paidReference && <p className="max-w-[160px] truncate font-mono text-[11px] text-navy/55">{o.paidReference}</p>}
                    </td>
                    <td className={td}>
                      <Link href={`/admin/orders/${o._id}`} className="whitespace-nowrap bg-navy px-3 py-1.5 text-xs font-semibold uppercase text-gold hover:bg-gold hover:text-navy">
                        {o.paymentStatus === 'awaiting_confirmation' ? 'Review' : 'Open'}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
          <AdminPagination meta={data?.meta} onPage={setPage} />
        </>
      )}
    </div>
  );
}