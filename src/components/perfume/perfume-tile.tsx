import Image from 'next/image';
import Link from 'next/link';
import { formatNaira } from '@/lib/utils';
import type { CloudImage, Variant } from '@/types';

export interface PerfumeTileData {
  _id: string;
  name: string;
  slug: string;
  images: CloudImage[];
  variants: Variant[];
  minPrice?: number;
  inStock?: boolean;
  brand?: { name: string } | null;
}

const SIZES = '(min-width: 1536px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 50vw';

export function PerfumeTile({
  perfume,
  priority = false,
}: {
  perfume: PerfumeTileData;
  priority?: boolean;
}) {
  const [cover, hover] = perfume.images ?? [];
  const prices = perfume.variants.map((v) => v.price);
  const minPrice = perfume.minPrice ?? (prices.length ? Math.min(...prices) : 0);
  const hasRange = new Set(prices).size > 1;
  const inStock = perfume.inStock ?? perfume.variants.some((v) => v.stock > 0);

  const cheapest = perfume.variants.find((v) => v.price === minPrice);
  const discount =
    cheapest?.compareAtPrice && cheapest.compareAtPrice > cheapest.price
      ? Math.round((1 - cheapest.price / cheapest.compareAtPrice) * 100)
      : 0;

  return (
    <Link href={`/perfumes/${perfume.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden border border-navy/10 bg-surface transition-colors group-hover:border-gold">
        {cover ? (
          <Image
            src={cover.url}
            alt={perfume.name}
            fill
            sizes={SIZES}
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-3xl italic text-gold-dark">
            {perfume.name.charAt(0)}
          </div>
        )}

        {/* Second image on hover (desktop) */}
        {hover && (
          <Image
            src={hover.url}
            alt=""
            fill
            sizes={SIZES}
            className="hidden object-cover opacity-0 transition-opacity duration-500 md:block md:group-hover:opacity-100"
          />
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1.5 sm:left-3 sm:top-3">
          {!inStock && (
            <span className="bg-navy px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Sold out
            </span>
          )}
          {inStock && discount > 0 && (
            <span className="bg-gold px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-navy">
              -{discount}%
            </span>
          )}
        </div>

        {/* Gold bar on hover */}
        <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
      </div>

      <div className="mt-3 space-y-1 sm:mt-4">
        {perfume.brand?.name && (
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark sm:text-xs">
            {perfume.brand.name}
          </p>
        )}
        <h3 className="line-clamp-2 font-serif text-sm leading-snug text-navy transition-colors group-hover:text-gold-dark sm:text-base">
          {perfume.name}
        </h3>
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-navy">
          <span>
            {hasRange && <span className="font-normal text-navy/50">From </span>}
            {formatNaira(minPrice)}
          </span>
          {discount > 0 && cheapest?.compareAtPrice && (
            <span className="text-xs font-normal text-navy/40 line-through">
              {formatNaira(cheapest.compareAtPrice)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}