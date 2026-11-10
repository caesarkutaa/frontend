import Link from 'next/link';
import { QrCode } from 'lucide-react';

/** Also shown if someone scans the QR of a perfume that was removed */
export default function PerfumeNotFound() {
  return (
    <div className="container-page flex flex-col items-center py-20 text-center sm:py-32">
      <span className="flex h-16 w-16 items-center justify-center bg-navy text-gold">
        <QrCode size={28} />
      </span>
      <h1 className="mt-6 text-3xl font-medium sm:text-4xl">Perfume not available</h1>
      <div className="mt-3 h-0.5 w-14 bg-gold" />
      <p className="mt-4 max-w-md text-sm text-navy/60 sm:text-base">
        This perfume is no longer listed in our store. If you scanned a QR code, please contact us
        so we can help confirm your product.
      </p>
      <Link
        href="/perfumes"
        className="mt-8 inline-flex h-12 items-center bg-navy px-8 text-sm font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-navy"
      >
        Browse the collection
      </Link>
    </div>
  );
}