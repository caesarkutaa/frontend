import type { Metadata } from 'next';
import Link from 'next/link';
import { POLICY_LAST_UPDATED, SITE_NAME } from '@/lib/constants';
import { getPublicSettings } from '@/lib/settings';
import { InfoPage, Prose } from '@/components/info/info-page';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: `The terms that apply when you use ${SITE_NAME} and buy from us.`,
  alternates: { canonical: '/terms' },
};

export default async function TermsPage() {
  const { contact } = await getPublicSettings();

  return (
    <InfoPage eyebrow="Legal" title="Terms of service" description={`Last updated: ${POLICY_LAST_UPDATED}`}>
      <Prose>
        <p>
          These terms apply when you use the {SITE_NAME} website and place orders with us. By creating an account or placing an order,
          you agree to them. Please read them carefully.
        </p>

        <h2>1. Your account</h2>
        <ul>
          <li>You must provide accurate information and keep your password safe.</li>
          <li>You are responsible for activity on your account. Tell us immediately if you suspect unauthorised use.</li>
          <li>We may suspend or close accounts involved in fraud, fake payment proofs, abuse or breaches of these terms.</li>
        </ul>

        <h2>2. Products and prices</h2>
        <ul>
          <li>We describe products as accurately as we can. Colours and packaging may vary slightly from photos.</li>
          <li>All prices are in Nigerian Naira (₦). Delivery fees are shown at checkout before you pay.</li>
          <li>If a price is clearly wrong because of an error, we may cancel the order and refund any payment in full.</li>
        </ul>

        <h2>3. Orders and payment</h2>
        <ul>
          <li>An order is confirmed only once payment is received — instantly for Paystack, or after we verify a bank transfer.</li>
          <li>Items are reserved when you place an order. Unpaid bank transfer orders are cancelled after 24 hours.</li>
          <li>Card payments are processed securely by Paystack. We never see or store your card details.</li>
          <li>Submitting false or altered payment proofs may lead to cancellation and account suspension.</li>
          <li>We may cancel orders if an item becomes unavailable; any payment made is refunded in full.</li>
        </ul>

        <h2>4. Delivery, returns and refunds</h2>
        <p>
          Delivery, returns and refunds are covered by our <Link href="/delivery-returns">Delivery &amp; returns policy</Link>, which forms
          part of these terms.
        </p>

        <h2>5. Authenticity and QR codes</h2>
        <p>
          QR codes on our products link to their official pages on this website. Copying, reproducing or misusing our QR codes, product
          pages or branding is not allowed.
        </p>

        <h2>6. Reviews</h2>
        <p>
          Reviews must be honest and relate to your own experience. We may hide or remove reviews that are abusive, misleading, off-topic or
          contain personal information.
        </p>

        <h2>7. Liability</h2>
        <p>
          Perfumes are for external use only. Please test on a small area of skin first and stop use if irritation occurs. To the extent
          permitted by Nigerian law, our liability for any order is limited to the amount you paid for it. Nothing in these terms limits
          your rights under the Federal Competition and Consumer Protection Act 2018.
        </p>

        <h2>8. Changes</h2>
        <p>We may update these terms from time to time. The “last updated” date above shows the latest version.</p>

        <h2>9. Governing law and contact</h2>
        <p>
          These terms are governed by the laws of the Federal Republic of Nigeria. Questions? Visit our <Link href="/contact">contact page</Link>
          {contact.email ? <> or email <a href={`mailto:${contact.email}`}>{contact.email}</a></> : null}.
        </p>
      </Prose>
    </InfoPage>
  );
}