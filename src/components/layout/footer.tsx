import Link from 'next/link';
import { NAV_LINKS, SITE_NAME, SITE_TAGLINE } from '@/lib/constants';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-4 border-gold bg-navy text-white">
      <div className="container-page grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 sm:py-16 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-serif text-2xl font-semibold text-gold">
            {SITE_NAME}
            <span className="text-white">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">{SITE_TAGLINE}</p>
        </div>

        <div>
          <h4 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Shop
          </h4>
          <ul className="space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/75 hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Account
          </h4>
          <ul className="space-y-2.5">
            <li>
              <Link href="/account" className="text-sm text-white/75 hover:text-gold">
                My Account
              </Link>
            </li>
            <li>
              <Link href="/orders" className="text-sm text-white/75 hover:text-gold">
                My Orders
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-sm text-white/75 hover:text-gold">
                Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Authenticity
          </h4>
          <p className="text-sm leading-relaxed text-white/75">
            Every bottle carries a unique QR code. Scan it to view the official product page and
            confirm it came from us.
          </p>
        </div>
      </div>

      <div className="border-t border-gold/30">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-white/55 sm:flex-row sm:text-left">
          <p>
            © {year} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-gold">Secure payments · Paystack & Bank Transfer</p>
        </div>
      </div>
    </footer>
  );
}