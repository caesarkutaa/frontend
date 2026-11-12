import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PerfumeTile } from '@/components/perfume/perfume-tile';
import type { PerfumeCard } from '@/types';

export function SectionHeading({ eyebrow, title, href, linkLabel = 'View all' }: { eyebrow: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-medium sm:text-3xl lg:text-4xl">{title}</h2>
        <div className="mt-3 h-0.5 w-14 bg-gold" />
      </div>
      {href && (
        <Link href={href} className="hidden shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wider underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark xs:inline-flex">
          {linkLabel} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

/** Swipeable row on phones, 4-column grid from tablet up */
export function ProductRail({ eyebrow, title, href, perfumes }: { eyebrow: string; title: string; href: string; perfumes: PerfumeCard[] }) {
  if (!perfumes.length) return null;

  return (
    <section className="container-page py-12 sm:py-16">
      <SectionHeading eyebrow={eyebrow} title={title} href={href} />
      <ul className="-mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:gap-5 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0">
        {perfumes.slice(0, 8).map((p) => (
          <li key={p._id} className="w-[46%] shrink-0 snap-start xs:w-[40%] sm:w-[30%] md:w-auto">
            <PerfumeTile perfume={p} />
          </li>
        ))}
      </ul>
      <Link href={href} className="mt-6 flex h-11 items-center justify-center border border-navy text-xs font-semibold uppercase tracking-wider hover:bg-navy hover:text-gold xs:hidden">
        View all
      </Link>
    </section>
  );
}