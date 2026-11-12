import type { Metadata } from 'next';
import { PaymentView } from '@/components/orders/payment-view';

export const metadata: Metadata = { title: 'Complete payment' };

export default async function OrderPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaymentView orderId={id} />;
}