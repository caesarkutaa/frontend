import type { Metadata } from 'next';
import Link from 'next/link';
import { Gem, QrCode, ShieldCheck, Truck } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { InfoPage, Prose } from '@/components/info/info-page';

export const metadata: Metadata = {
  title: 'About us',
  description: `Learn about ${SITE_NAME} — authentic designer and niche perfumes, verified by QR.`,
  alternates: { canonical: '/about' },
};

const VALUES = [
  { icon: ShieldCheck, title: 'Only authentic', text: 'We buy from trusted distributors and never sell copies or “inspired” fakes.' },
  { icon: QrCode, title: 'Verifiable', text: 'Each bottle carries a QR code that opens its official page on our site.' },
  { icon: Gem, title: 'Carefully curated', text: 'Designer classics and niche discoveries chosen for quality and longevity.' },
  { icon: Truck, title: 'Delivered with care', text: 'Securely packed and delivered across Nigeria.' },
];

export default function AboutPage() {
  return (
    <InfoPage eyebrow="Our story" title={`About ${SITE_NAME}`} description="Authentic fragrances, verified by QR.">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <Prose>
          <h2>Why we started</h2>
          <p>
            Buying perfume in Nigeria shouldn’t be a gamble. Too many people pay full price for a bottle that turns out to be a
            copy — weak, short-lived, and sometimes harmful to the skin. {SITE_NAME} was built to fix that.
          </p>
          <p>
            We source every fragrance from trusted distributors, describe each one honestly — from its top notes to how long it
            lasts — and let you compare sizes and prices before you buy.
          </p>

          <h2>The QR promise</h2>
          <p>
            Every bottle we sell carries a unique QR sticker. Scan it with your phone camera and it opens the official product
            page on our website. If a “{SITE_NAME}” bottle doesn’t lead here, it didn’t come from us.
          </p>

          <h2>How we work</h2>
          <ul>
            <li>Clear prices in naira, with every size listed</li>
            <li>Secure payment by card (Paystack) or bank transfer</li>
            <li>Real reviews — only from customers who received the perfume</li>
            <li>Friendly support on WhatsApp, phone and email</li>
          </ul>

          <p className="!mt-8">
            <Link href="/perfumes">Explore the collection</Link> or <Link href="/contact">get in touch</Link> — we’d love to help you
            find your signature scent.
          </p>
        </Prose>

        <ul className="grid h-fit gap-4 xs:grid-cols-2 lg:grid-cols-1">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 border-t-4 border-gold bg-surface p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-navy text-gold">
                <Icon size={20} />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-navy/65">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </InfoPage>
  );
}