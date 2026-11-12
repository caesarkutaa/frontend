import type { Metadata } from 'next';
import { OrdersTable } from '@/components/admin/orders-table';

export const metadata: Metadata = { title: 'Orders' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  return <OrdersTable initialOrderStatus={one(q.orderStatus)} initialPaymentStatus={one(q.paymentStatus)} />;
}