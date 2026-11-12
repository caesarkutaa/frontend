import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { INFO_LINKS, LEGAL_LINKS, NAV_LINKS, SITE_NAME, SITE_TAGLINE } from '@/lib/constants';
import type { PublicSettings } from '@/types/settings';

function InstagramIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const linkClass = 'text-sm text-white/75 hover:text-gold';
const headingClass = 'mb-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold';

export function Footer({ settings }: { settings: PublicSettings }) {
  const year = new Date().getFullYear();
  const { contact } = settings;
  const instagram = contact.instagram?.replace(/^@/, '');
  const hasContact = contact.phone || contact.email || contact.address || instagram || contact.businessHours;

  return (
    <footer className="mt-auto border-t-4 border-gold bg-navy text-white">
      <div className="container-page grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 sm:py-16 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
        <div>
          <p className="font-serif text-2xl font-semibold text-gold">
            {SITE_NAME}
            <span className="text-white">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">{SITE_TAGLINE}</p>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-white/55">
            Every bottle carries a unique QR code. Scan it to confirm it came from us.
          </p>
        </div>

        <div>
          <h4 className={headingClass}>Shop</h4>
          <ul className="space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}><Link href={link.href} className={linkClass}>{link.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className={headingClass}>Help</h4>
          <ul className="space-y-2.5">
            {INFO_LINKS.map((link) => (
              <li key={link.href}><Link href={link.href} className={linkClass}>{link.label}</Link></li>
            ))}
            <li><Link href="/orders" className={linkClass}>Track my order</Link></li>
            <li><Link href="/account" className={linkClass}>My account</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={headingClass}>Contact</h4>
          {hasContact ? (
            <ul className="space-y-3 text-sm text-white/75">
              {contact.phone && (
                <li className="flex gap-2.5"><Phone size={16} className="mt-0.5 shrink-0 text-gold" /><a href={`tel:${contact.phone}`} className="hover:text-gold">{contact.phone}</a></li>
              )}
              {contact.email && (
                <li className="flex gap-2.5"><Mail size={16} className="mt-0.5 shrink-0 text-gold" /><a href={`mailto:${contact.email}`} className="break-all hover:text-gold">{contact.email}</a></li>
              )}
              {contact.address && (
                <li className="flex gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-gold" /><span>{contact.address}</span></li>
              )}
              {contact.businessHours && (
                <li className="flex gap-2.5"><Clock size={16} className="mt-0.5 shrink-0 text-gold" /><span>{contact.businessHours}</span></li>
              )}
              {instagram && (
                <li className="flex gap-2.5">
                  <InstagramIcon size={16} className="mt-0.5 shrink-0 text-gold" />
                  <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold">@{instagram}</a>
                </li>
              )}
            </ul>
          ) : (
            <Link href="/contact" className={linkClass}>Contact us</Link>
          )}
        </div>
      </div>

      <div className="border-t border-gold/30">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-white/55 sm:flex-row sm:text-left">
          <p>© {year} {SITE_NAME}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-gold">{link.label}</Link>
            ))}
            <span className="text-gold">Secure payments · Paystack & Bank Transfer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}