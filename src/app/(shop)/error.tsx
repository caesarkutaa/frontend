'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';

export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center py-20 text-center sm:py-28">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-gold">
        <TriangleAlert size={30} />
      </span>
      <h1 className="mt-6 text-2xl font-medium sm:text-3xl">Something went wrong</h1>
      <div className="mt-3 h-0.5 w-14 bg-gold" />
      <p className="mt-4 max-w-md text-sm text-navy/65 sm:text-base">
        We couldn’t load this page right now. Please try again — if it keeps happening, our team has been notified.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 xs:w-auto xs:flex-row">
        <button type="button" onClick={reset} className="flex h-12 items-center justify-center bg-navy px-8 text-sm font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-navy">
          Try again
        </button>
        <Link href="/" className="flex h-12 items-center justify-center border border-navy px-8 text-sm font-semibold uppercase tracking-wider hover:bg-navy hover:text-gold">
          Go home
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-navy/40">Error reference: {error.digest}</p>}
    </div>
  );
}