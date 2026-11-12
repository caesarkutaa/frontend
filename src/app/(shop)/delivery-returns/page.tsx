import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicSettings } from '@/lib/settings';
import { isAlwaysFree } from '@/lib/delivery';
import { formatNaira } from '@/lib/utils';
import { NIGERIAN_STATES } from '@/lib/constants';
import { InfoPage, Prose } from '@/components/info/info-page';

export const metadata: Metadata = {
  title: 'Delivery & returns',
  description: 'Delivery fees by state, delivery times, payment windows and our returns policy.',
  alternates: { canonical: '/delivery-returns' },
};

export default async function DeliveryReturnsPage() {
  const { delivery, contact, whatsapp } = await getPublicSettings();
  const free = isAlwaysFree(delivery);
  const customFee = new Map(delivery.stateFees.map((f) => [f.state.toLowerCase(), f.fee]));
  const feeFor = (state: string) => customFee.get(state.toLowerCase()) ?? delivery.defaultFee;

  return (
    <InfoPage eyebrow="Help" title="Delivery & returns" description="Everything about getting your fragrance to you — and what happens if something isn’t right.">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <Prose>
          <h2>Delivery</h2>
          <p>We deliver to all 36 states and the FCT.</p>
          <ul>
            {free ? (
              <li><strong>Delivery is free</strong> on every order.</li>
            ) : (
              <>
                <li>Delivery fees depend on your state — see the table. The exact fee is shown at checkout before you pay.</li>
                {delivery.freeShippingMin > 0 && (
                  <li><strong>Free delivery</strong> on orders of {formatNaira(delivery.freeShippingMin)} or more.</li>
                )}
              </>
            )}
            {delivery.estimatedDays && <li>Estimated delivery time: <strong>{delivery.estimatedDays}</strong> after payment is confirmed.</li>}
            <li>We’ll email you when your order ships and when it’s delivered. You can also follow it in <Link href="/orders">My orders</Link>.</li>
          </ul>

          <h2>Payment window</h2>
          <p>
            Items are reserved for you as soon as you place an order. If paying by bank transfer, please complete payment and upload your
            receipt within <strong>24 hours</strong> — unpaid orders are cancelled automatically and the items are released.
          </p>

          <h2>Returns & exchanges</h2>
          <p>Because perfume is a personal-care product, we can only accept returns on items that are:</p>
          <ul>
            <li><strong>Unopened</strong>, with the original seal and cellophane intact</li>
            <li>Reported within <strong>7 days</strong> of delivery</li>
            <li>In the original packaging, with the QR sticker in place</li>
          </ul>
          <p>Opened or used perfumes can’t be returned unless they are faulty.</p>

          <h3>Damaged, faulty or wrong item?</h3>
          <p>
            Contact us within <strong>48 hours</strong> of delivery with your order number and clear photos. If an item arrived broken, leaked,
            or isn’t what you ordered, we’ll replace it or refund you in full — including delivery.
          </p>

          <h2>Refunds</h2>
          <ul>
            <li>Approved refunds are paid to your original payment method (card via Paystack, or your bank account for transfers).</li>
            <li>Refunds are usually processed within <strong>5–10 working days</strong> after we receive and inspect the item.</li>
            <li>If an order is cancelled after payment (for example, an item sells out), you receive a full refund.</li>
          </ul>

          <h2>Need help?</h2>
          <p>
            Reach us via the <Link href="/contact">contact page</Link>
            {whatsapp ? ' or the WhatsApp button on any page' : ''}
            {contact.email ? <>, or email <a href={`mailto:${contact.email}`}>{contact.email}</a></> : ''}.
          </p>
        </Prose>

        {/* Fee table */}
        <aside className="h-fit border-t-4 border-gold bg-surface p-5 sm:p-6 lg:sticky lg:top-32">
          <h2 className="font-serif text-2xl">Delivery fees</h2>
          {free ? (
            <p className="mt-3 text-sm">All states: <strong className="text-success">Free</strong></p>
          ) : (
            <>
              {delivery.freeShippingMin > 0 && (
                <p className="mt-2 text-sm text-navy/70">Free on orders over <strong>{formatNaira(delivery.freeShippingMin)}</strong></p>
              )}
              <div className="mt-4 max-h-[28rem] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-navy text-left text-[11px] uppercase tracking-wider text-gold">
                    <tr>
                      <th className="px-3 py-2">State</th>
                      <th className="px-3 py-2 text-right">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/10">
                    {NIGERIAN_STATES.map((s) => {
                      const fee = feeFor(s);
                      return (
                        <tr key={s}>
                          <td className="px-3 py-2">{s}</td>
                          <td className="px-3 py-2 text-right font-semibold">{fee === 0 ? <span className="text-success">Free</span> : formatNaira(fee)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </aside>
      </div>
    </InfoPage>
  );
}