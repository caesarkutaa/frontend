import Link from 'next/link';
import { QrCode, ShieldCheck, Truck } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: '100% Authentic',
    text: 'Sourced directly from trusted distributors. No fakes, ever.',
  },
  {
    icon: QrCode,
    title: 'QR Verified',
    text: 'Scan the code on any bottle to view its official product page.',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    text: 'Every order ships free, anywhere we deliver.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — navy */}
      <section className="relative overflow-hidden border-b-4 border-gold bg-navy text-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-gold/10" />

        <div className="container-page relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <div className="text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold sm:text-sm">
              The Fragrance Gallery
            </p>
            <h1 className="mt-4 text-4xl font-medium leading-[1.1] xs:text-5xl sm:text-6xl xl:text-7xl">
              Find the scent that <span className="italic text-gold">defines</span> you.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base lg:mx-0">
              Designer and niche perfumes, carefully curated. Explore every note, compare sizes,
              and order in minutes.
            </p>
            <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:justify-center lg:justify-start">
              <Link
                href="/perfumes"
                className="inline-flex h-12 items-center justify-center bg-gold px-8 text-sm font-semibold uppercase tracking-wider text-navy transition-colors hover:bg-gold-light sm:h-14"
              >
                Shop the collection
              </Link>
              <Link
                href="/brands"
                className="inline-flex h-12 items-center justify-center border border-gold px-8 text-sm font-semibold uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-navy sm:h-14"
              >
                Browse brands
              </Link>
            </div>
          </div>

          {/* Decorative visual */}
          <div className="relative mx-auto aspect-square w-full max-w-[280px] xs:max-w-sm lg:max-w-md">
            <div className="absolute inset-0 rounded-full border-2 border-gold/60" />
            <div className="absolute inset-6 rounded-full border border-gold/40 sm:inset-10" />
            <div className="absolute inset-12 flex items-center justify-center rounded-full bg-gold shadow-2xl sm:inset-20">
              <span className="font-serif text-5xl italic text-navy sm:text-6xl">P.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features — white */}
      <section className="container-page py-14 sm:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">
            Why shop with us
          </p>
          <h2 className="mt-2 text-3xl font-medium sm:text-4xl">The promise in every bottle</h2>
          <div className="mx-auto mt-4 h-0.5 w-16 bg-gold" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="border-t-4 border-gold bg-surface p-6 transition-shadow hover:shadow-lg sm:p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center bg-navy text-gold">
                <Icon size={22} />
              </span>
              <h3 className="mt-5 text-xl font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/65">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}