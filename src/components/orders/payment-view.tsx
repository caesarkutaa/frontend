'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  CircleCheck,
  CircleX,
  Clock,
  CreditCard,
  Hourglass,
  Landmark,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { cn, formatNaira } from '@/lib/utils';
import { Button, buttonClasses } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { PageHeader } from '@/components/ui/page-header';
import { PageLoader } from '@/components/ui/spinner';
import { StateMessage } from '@/components/ui/state-message';
import { Countdown } from './countdown';
import { PaymentProofForm } from './payment-proof-form';
import type { PaymentInfo, PaystackStart } from '@/types/checkout';

export function PaymentView({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'bank' | 'card'>('bank');
  const [redirecting, setRedirecting] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['order-payment', orderId],
    queryFn: async () => (await api.get<PaymentInfo>(`/orders/${orderId}/payment`)).data,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['order-payment', orderId] });
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  const payWithCard = async () => {
    setRedirecting(true);
    try {
      const { data: start } = await api.post<PaystackStart>(`/orders/${orderId}/pay/paystack`);
      toast.loading('Redirecting to secure payment...');
      window.location.href = start.authorizationUrl;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not start card payment'));
      setRedirecting(false);
    }
  };

  if (isLoading) return <PageLoader label="Loading payment details..." />;

  if (isError || !data) {
    return (
      <StateMessage
        icon={CircleX}
        tone="error"
        title="Order not found"
        description={getErrorMessage(error, 'We could not load this order.')}
      >
        <Link href="/orders" className={buttonClasses({ size: 'lg' })}>
          My orders
        </Link>
      </StateMessage>
    );
  }

  const orderLink = (
    <Link href={`/orders/${data.orderId}`} className={buttonClasses({ size: 'lg' })}>
      View order
    </Link>
  );

  /* ---------- Terminal / waiting states ---------- */
  if (data.paymentStatus === 'paid') {
    return (
      <StateMessage
        icon={CircleCheck}
        tone="success"
        title="Payment received"
        description={`Order ${data.orderNumber} is paid and is being prepared for delivery.`}
      >
        {orderLink}
      </StateMessage>
    );
  }

  if (data.orderStatus === 'cancelled') {
    return (
      <StateMessage
        icon={CircleX}
        tone="error"
        title="This order was cancelled"
        description="Payment can no longer be made for this order. Please place a new order."
      >
        <Link href="/perfumes" className={buttonClasses({ size: 'lg' })}>
          Continue shopping
        </Link>
      </StateMessage>
    );
  }

  if (data.paymentStatus === 'awaiting_confirmation') {
    return (
      <StateMessage
        icon={Hourglass}
        tone="navy"
        title="We’re reviewing your payment"
        description="Thanks! Your payment proof has been received. You’ll see the status change on your order once it is confirmed."
      >
        {orderLink}
      </StateMessage>
    );
  }

  if (!data.payable) {
    return (
      <StateMessage icon={TriangleAlert} tone="gold" title="Payment unavailable" description="This order can’t be paid right now.">
        {orderLink}
      </StateMessage>
    );
  }

  /* ---------- Payable ---------- */
  const bank = data.bankTransfer;
  const showTabs = !!bank && data.paystackEnabled;
  const activeTab = !bank ? 'card' : !data.paystackEnabled ? 'bank' : tab;

  return (
    <div className="pb-16 sm:pb-24">
      <PageHeader
        eyebrow="Complete your payment"
        title={formatNaira(data.amount)}
        backHref={`/orders/${data.orderId}`}
        backLabel={`Order ${data.orderNumber}`}
      >
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <span className="flex items-center gap-2 text-white/80">
            <Clock size={16} className="text-gold" /> Time left: <Countdown deadline={data.deadline} />
          </span>
          <span className="flex items-center gap-2 text-white/80">
            Reference: <span className="font-semibold text-gold">{data.orderNumber}</span>
          </span>
        </div>
      </PageHeader>

      <div className="container-page max-w-4xl pt-8 sm:pt-10">
        {data.paymentStatus === 'rejected' && (
          <div className="mb-6 border-l-4 border-error bg-error/10 p-4 text-sm">
            <p className="font-semibold text-error">Your previous payment proof was not accepted</p>
            {data.rejectionReason && <p className="mt-1 text-navy/80">Reason: {data.rejectionReason}</p>}
            <p className="mt-1 text-navy/70">Please upload a new proof or pay with your card.</p>
          </div>
        )}

        {/* Method tabs */}
        {showTabs && (
          <div className="mb-8 grid grid-cols-2 border border-navy">
            {(
              [
                { key: 'bank', label: 'Bank transfer', icon: Landmark },
                { key: 'card', label: 'Pay with card', icon: CreditCard },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'flex h-12 items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors sm:h-14 sm:text-sm',
                  activeTab === key ? 'bg-navy text-gold' : 'text-navy hover:bg-gold/15',
                )}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'bank' && bank ? (
          <div className="space-y-8">
            {/* Steps */}
            <ol className="grid gap-3 sm:grid-cols-3">
              {[
                `Transfer exactly ${formatNaira(bank.amount)}`,
                `Use ${bank.reference} as the narration`,
                'Upload your receipt screenshot below',
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-3 border-t-4 border-gold bg-surface p-4 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-navy text-xs font-bold text-gold">
                    {i + 1}
                  </span>
                  <span className="font-medium">{step}</span>
                </li>
              ))}
            </ol>

            {/* Accounts */}
            <section>
              <h2 className="text-xl font-medium sm:text-2xl">Pay into any of these accounts</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {bank.bankAccounts.map((account) => (
                  <div key={account._id} className="bg-navy p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      {account.bankName}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="font-mono text-2xl font-semibold tracking-wider sm:text-3xl">
                        {account.accountNumber}
                      </p>
                      <CopyButton
                        value={account.accountNumber}
                        className="bg-gold text-navy hover:bg-gold-light hover:text-navy"
                      />
                    </div>
                    <p className="mt-2 text-sm text-white/80">{account.accountName}</p>
                    {account.note && <p className="mt-2 text-xs text-gold-light">{account.note}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-gold bg-gold/10 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
                    Transfer narration / reference
                  </p>
                  <p className="mt-1 font-mono text-lg font-semibold">{bank.reference}</p>
                </div>
                <CopyButton value={bank.reference} />
              </div>
            </section>

            {/* Proof upload */}
            <section className="border-t-4 border-gold bg-surface p-5 sm:p-8">
              <h2 className="text-xl font-medium sm:text-2xl">Upload payment proof</h2>
              <p className="mt-1 text-sm text-navy/60">
                After transferring, upload a screenshot of the successful transaction.
              </p>
              <div className="mt-6">
                <PaymentProofForm
                  orderId={data.orderId}
                  accounts={bank.bankAccounts}
                  amount={bank.amount}
                  onSuccess={refresh}
                />
              </div>
            </section>
          </div>
        ) : (
          <section className="border-t-4 border-gold bg-surface p-6 text-center sm:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center bg-navy text-gold">
              <CreditCard size={26} />
            </span>
            <h2 className="mt-5 text-2xl font-medium">Pay securely with Paystack</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-navy/65">
              Use your debit card, bank account, USSD or bank transfer through Paystack. Your
              order is confirmed automatically once payment succeeds.
            </p>
            <Button
              variant="gold"
              size="lg"
              className="mt-6 w-full xs:w-auto"
              loading={redirecting}
              onClick={payWithCard}
            >
              Pay {formatNaira(data.amount)}
            </Button>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-navy/55">
              <ShieldCheck size={14} className="text-gold-dark" /> Secured by Paystack
            </p>
          </section>
        )}
      </div>
    </div>
  );
}