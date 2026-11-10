import Link from 'next/link';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — large screens only */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r-4 border-gold bg-navy p-12 text-white lg:flex xl:p-16">
        <Link href="/" className="font-serif text-2xl font-semibold text-gold">
          {SITE_NAME}
          <span className="text-white">.</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Signature Scents
          </p>
          <h1 className="mt-4 text-4xl font-medium leading-tight xl:text-5xl">
            Wear a fragrance that tells your <span className="italic text-gold">story</span>.
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-white/65">{SITE_TAGLINE}</p>
        </div>

        <p className="text-xs text-white/45">
          © {new Date().getFullYear()} {SITE_NAME}
        </p>

        {/* Decorative gold rings */}
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full border-2 border-gold/50" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full border border-gold/40" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/10" />
      </aside>

      {/* Form side */}
      <section className="flex flex-col bg-white">
        <header className="flex h-16 items-center justify-between border-b-2 border-gold bg-navy px-4 sm:px-6 lg:hidden">
          <Link href="/" className="font-serif text-xl font-semibold text-gold">
            {SITE_NAME}
            <span className="text-white">.</span>
          </Link>
          <Link href="/" className="text-xs uppercase tracking-wider text-white/70 hover:text-gold">
            Back to shop
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
          <div className="w-full max-w-md sm:border-t-4 sm:border-gold sm:bg-surface sm:p-8 sm:shadow-sm lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}