import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { InfoPage } from '@/components/info/info-page';
import { JsonLd } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Frequently asked questions',
  description: 'Answers about authenticity, QR verification, payment, delivery and returns.',
  alternates: { canonical: '/faq' },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Are your perfumes original?',
    a: `Yes. ${SITE_NAME} only sells authentic perfumes sourced from trusted distributors. Every bottle carries a QR code you can scan to confirm it came from us.`,
  },
  {
    q: 'How does the QR code work?',
    a: 'Open your phone camera and point it at the QR sticker on the bottle or box. It opens the official page for that exact perfume on our website. If it doesn’t lead to our site, the bottle didn’t come from us.',
  },
  {
    q: 'How can I pay?',
    a: 'Pay instantly by card, bank, USSD or transfer through Paystack, or make a direct bank transfer to our account and upload your receipt. Transfers are confirmed by our team, usually within a few hours.',
  },
  {
    q: 'How long do I have to pay for a bank transfer order?',
    a: 'Please pay and upload your receipt within 24 hours. Unpaid orders are cancelled automatically so the items can be released to other customers.',
  },
  {
    q: 'How much is delivery and how long does it take?',
    a: 'Delivery fees depend on your state and are shown at checkout before you pay. See our Delivery & returns page for the full fee table and estimated delivery times.',
  },
  {
    q: 'Can I return a perfume?',
    a: 'Unopened, sealed perfumes can be returned within 7 days of delivery. If an item arrives damaged, faulty or wrong, contact us within 48 hours with photos and we’ll replace or refund it.',
  },
  {
    q: 'How do I track my order?',
    a: 'Log in and go to My orders. You’ll see live updates as your payment is confirmed and your order ships, and we also send email updates.',
  },
  {
    q: 'Who can write reviews?',
    a: 'Only customers who have received the perfume. That keeps our ratings honest and genuinely helpful.',
  },
];

export default function FaqPage() {
  return (
    <InfoPage eyebrow="Help" title="Frequently asked questions">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />

      <div className="max-w-3xl">
        <ul className="divide-y divide-navy/10 border-y border-navy/10">
          {FAQS.map((f) => (
            <li key={f.q}>
              <details className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold marker:hidden hover:text-gold-dark [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-navy text-gold transition-transform group-open:rotate-45">
                    <Plus size={16} />
                  </span>
                </summary>
                <p className="pb-5 pr-12 text-sm leading-relaxed text-navy/75 sm:text-base">{f.a}</p>
              </details>
            </li>
          ))}
        </ul>

        <div className="mt-10 border-t-4 border-gold bg-navy p-6 text-white">
          <p className="font-serif text-xl text-gold">Still have a question?</p>
          <p className="mt-1 text-sm text-white/75">We’re happy to help you choose a fragrance or sort out an order.</p>
          <Link href="/contact" className="mt-4 inline-flex h-11 items-center bg-gold px-6 text-xs font-semibold uppercase tracking-wider text-navy hover:bg-gold-light">
            Contact us
          </Link>
        </div>
      </div>
    </InfoPage>
  );
}