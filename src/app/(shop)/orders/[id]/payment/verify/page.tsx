import type { Metadata } from 'next';
import { PaystackVerify } from '@/components/orders/paystack-verify';

export const metadata: Metadata = { title: 'Confirming payment' };

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Paystack redirects here with ?reference=...&trxref=... */
export default async function PaystackVerifyPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const query = await searchParams;
  const raw = query.reference ?? query.trxref;
  const reference = Array.isArray(raw) ? raw[0] : raw;

  return <PaystackVerify orderId={id} reference={reference} />;
}