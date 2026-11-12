'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center border-t-4 border-gold bg-white px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center bg-navy text-gold">
        <TriangleAlert size={26} />
      </span>
      <h1 className="mt-5 text-2xl font-medium">This admin page failed to load</h1>
      <p className="mt-2 max-w-md text-sm text-navy/65">{error.message || 'An unexpected error occurred.'}</p>
      <div className="mt-6 flex flex-col gap-2 xs:flex-row">
        <button type="button" onClick={reset} className="flex h-11 items-center justify-center bg-gold px-6 text-sm font-semibold uppercase tracking-wider text-navy hover:bg-navy hover:text-gold">
          Try again
        </button>
        <Link href="/admin" className="flex h-11 items-center justify-center border border-navy px-6 text-sm font-semibold uppercase tracking-wider hover:bg-navy hover:text-gold">
          Dashboard
        </Link>
      </div>
      {error.digest && <p className="mt-4 text-xs text-navy/40">Reference: {error.digest}</p>}
    </div>
  );
}