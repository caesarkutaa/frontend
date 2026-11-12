import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-navy text-white">
      <header className="border-b-2 border-gold">
        <div className="container-page flex h-16 items-center sm:h-20">
          <Link href="/" className="font-serif text-xl font-semibold text-gold xs:text-2xl">
            {SITE_NAME}
            <span className="text-white">.</span>
          </Link>
        </div>
      </header>

      <main className="container-page flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="font-serif text-[7rem] leading-none text-gold sm:text-[10rem]">404</p>
        <div className="mt-2 h-0.5 w-16 bg-gold" />
        <h1 className="mt-6 text-3xl font-medium sm:text-4xl">This page has evaporated</h1>
        <p className="mt-3 max-w-md text-sm text-white/70 sm:text-base">
          Like the top notes of a fragrance, the page you’re looking for has faded away — or never existed.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 xs:w-auto xs:flex-row">
          <Link href="/" className="flex h-12 items-center justify-center bg-gold px-8 text-sm font-semibold uppercase tracking-wider text-navy hover:bg-gold-light">
            Go home
          </Link>
          <Link href="/perfumes" className="flex h-12 items-center justify-center border border-gold px-8 text-sm font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-navy">
            Shop perfumes
          </Link>
        </div>
      </main>
    </div>
  );
}