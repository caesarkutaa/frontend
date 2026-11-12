import type { Metadata } from 'next';
import { PaymentsTable } from '@/components/admin/payments-table';

export const metadata: Metadata = { title: 'Payments' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminPaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  const q = await searchParams;
  const status = Array.isArray(q.paymentStatus) ? q.paymentStatus[0] : q.paymentStatus;
  return <PaymentsTable initialStatus={status ?? ''} />;
}