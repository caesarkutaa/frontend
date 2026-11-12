import type { Metadata } from 'next';
import Link from 'next/link';
import { POLICY_LAST_UPDATED, SITE_NAME } from '@/lib/constants';
import { getPublicSettings } from '@/lib/settings';
import { InfoPage, Prose } from '@/components/info/info-page';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: `How ${SITE_NAME} collects, uses and protects your personal data.`,
  alternates: { canonical: '/privacy' },
};

export default async function PrivacyPage() {
  const { contact } = await getPublicSettings();

  return (
    <InfoPage eyebrow="Legal" title="Privacy policy" description={`Last updated: ${POLICY_LAST_UPDATED}`}>
      <Prose>
        <p>
          {SITE_NAME} respects your privacy. This policy explains what personal data we collect, why, and your rights under the Nigeria Data
          Protection Act 2023 (NDPA).
        </p>

        <h2>1. What we collect</h2>
        <ul>
          <li><strong>Account details:</strong> name, email, phone number and password (stored securely as a one-way hash).</li>
          <li><strong>Order details:</strong> delivery address, items purchased and order history.</li>
          <li><strong>Payment information:</strong> payment references, and for bank transfers the receipt screenshot and sender name you upload. Card details are handled by Paystack — we never see or store them.</li>
          <li><strong>Reviews</strong> you choose to publish (shown with your first name and last initial only).</li>
          <li><strong>Technical data:</strong> basic logs such as IP address, used to keep the site secure.</li>
        </ul>

        <h2>2. Why we use it</h2>
        <ul>
          <li>To create your account, process and deliver your orders, and confirm payments</li>
          <li>To send order updates, password reset links and important service emails</li>
          <li>To provide customer support</li>
          <li>To prevent fraud and keep our store secure</li>
          <li>To meet legal and tax obligations</li>
        </ul>
        <p>We do not sell your personal data, and we do not send marketing emails without your consent.</p>

        <h2>3. Who we share it with</h2>
        <p>Only trusted service providers who help us run the store, under appropriate safeguards:</p>
        <ul>
          <li><strong>Paystack</strong> — card and online payments</li>
          <li><strong>Cloudinary</strong> — secure storage of product images and payment receipts</li>
          <li><strong>Resend</strong> — sending order and account emails</li>
          <li><strong>Delivery partners</strong> — your name, phone and address, only to deliver your order</li>
        </ul>
        <p>We may also disclose data where required by law.</p>

        <h2>4. Cookies</h2>
        <p>
          We use one essential, secure cookie to keep you logged in. If you shop without an account, your bag is saved in your browser so it
          isn’t lost. We do not use advertising or tracking cookies.
        </p>

        <h2>5. How long we keep it</h2>
        <p>
          We keep account data while your account is active, and order and payment records for as long as required for accounting and tax
          purposes (generally up to 6 years). You can ask us to delete your account at any time.
        </p>

        <h2>6. Security</h2>
        <p>
          Passwords are hashed, connections are encrypted (HTTPS), and access to customer data is limited to authorised staff. No system is
          perfectly secure, but we take reasonable steps to protect your information.
        </p>

        <h2>7. Your rights</h2>
        <p>Under the NDPA you can ask us to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data (you can also edit it in <Link href="/account">My account</Link>)</li>
          <li>Delete your data, where we don’t need to keep it by law</li>
          <li>Object to or restrict certain processing, or withdraw consent</li>
        </ul>
        <p>You may also lodge a complaint with the Nigeria Data Protection Commission (NDPC).</p>

        <h2>8. Contact</h2>
        <p>
          For any privacy request, contact us via the <Link href="/contact">contact page</Link>
          {contact.email ? <> or email <a href={`mailto:${contact.email}`}>{contact.email}</a></> : null}.
        </p>
      </Prose>
    </InfoPage>
  );
}