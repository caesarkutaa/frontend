import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { getPublicSettings } from '@/lib/settings';
import { SITE_NAME } from '@/lib/constants';
import { InfoPage } from '@/components/info/info-page';
import { WhatsAppIcon } from '@/components/layout/whatsapp-button';

export const metadata: Metadata = {
  title: 'Contact us',
  description: `Get in touch with ${SITE_NAME} on WhatsApp, phone or email.`,
  alternates: { canonical: '/contact' },
};

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default async function ContactPage() {
  const { contact, whatsapp } = await getPublicSettings();
  const instagram = contact.instagram?.replace(/^@/, '');

  const cards = [
    whatsapp && {
      key: 'whatsapp',
      icon: <WhatsAppIcon className="h-6 w-6" />,
      title: 'WhatsApp',
      value: `+${whatsapp.number}`,
      href: `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(whatsapp.message)}`,
      action: 'Start a chat',
      highlight: true,
    },
    contact.phone && { key: 'phone', icon: <Phone size={22} />, title: 'Call us', value: contact.phone, href: `tel:${contact.phone}`, action: 'Call now' },
    contact.email && { key: 'email', icon: <Mail size={22} />, title: 'Email', value: contact.email, href: `mailto:${contact.email}`, action: 'Send an email' },
    instagram && {
      key: 'instagram',
      icon: <InstagramIcon className="h-6 w-6" />,
      title: 'Instagram',
      value: `@${instagram}`,
      href: `https://instagram.com/${instagram}`,
      action: 'Follow us',
    },
  ].filter(Boolean) as { key: string; icon: React.ReactNode; title: string; value: string; href: string; action: string; highlight?: boolean }[];

  return (
    <InfoPage eyebrow="We’re here to help" title="Contact us" description="Questions about a fragrance, your order or delivery? Reach us any way you like.">
      {cards.length === 0 && !contact.address ? (
        <p className="border-l-4 border-gold bg-gold/10 p-4 text-sm">Contact details will be available soon.</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <ul className="grid gap-4 sm:grid-cols-2">
            {cards.map((c) => (
              <li key={c.key}>
                <a
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={
                    c.highlight
                      ? 'group flex h-full flex-col border-t-4 border-gold bg-navy p-6 text-white transition-colors hover:bg-navy-light'
                      : 'group flex h-full flex-col border-t-4 border-gold bg-surface p-6 transition-shadow hover:shadow-lg'
                  }
                >
                  <span className={c.highlight ? 'flex h-12 w-12 items-center justify-center bg-gold text-navy' : 'flex h-12 w-12 items-center justify-center bg-navy text-gold'}>
                    {c.icon}
                  </span>
                  <p className={c.highlight ? 'mt-5 text-xs font-bold uppercase tracking-wider text-gold' : 'mt-5 text-xs font-bold uppercase tracking-wider text-gold-dark'}>
                    {c.title}
                  </p>
                  <p className="mt-1 break-all text-lg font-semibold">{c.value}</p>
                  <span className={c.highlight ? 'mt-auto pt-4 text-xs font-semibold uppercase tracking-wider text-gold' : 'mt-auto pt-4 text-xs font-semibold uppercase tracking-wider underline decoration-gold underline-offset-4'}>
                    {c.action} →
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <aside className="h-fit space-y-4">
            {contact.address && (
              <div className="flex gap-4 border border-navy/10 p-5">
                <MapPin size={22} className="mt-0.5 shrink-0 text-gold-dark" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gold-dark">Address</p>
                  <p className="mt-1 text-sm">{contact.address}</p>
                </div>
              </div>
            )}
            {contact.businessHours && (
              <div className="flex gap-4 border border-navy/10 p-5">
                <Clock size={22} className="mt-0.5 shrink-0 text-gold-dark" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gold-dark">Business hours</p>
                  <p className="mt-1 text-sm">{contact.businessHours}</p>
                </div>
              </div>
            )}
            <div className="border-l-4 border-gold bg-gold/10 p-5 text-sm">
              <p className="font-semibold">Have a question about an order?</p>
              <p className="mt-1 text-navy/70">
                Include your order number (e.g. PF-…) so we can help faster. You can also track it in{' '}
                <Link href="/orders" className="font-semibold underline decoration-gold underline-offset-4">My orders</Link>.
              </p>
            </div>
          </aside>
        </div>
      )}
    </InfoPage>
  );
}