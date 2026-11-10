import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { serverFetch } from '@/lib/server-api';
import type { Brand } from '@/types';

export const metadata: Metadata = {
  title: 'Brands',
  description: 'Explore perfumes by brand.',
};

export default async function BrandsPage() {
  const brands = await serverFetch<Brand[]>('/brands', { revalidate: 300 }).catch(
    () => [] as Brand[],
  );

  return (
    <div className="pb-16 sm:pb-24">
      <section className="border-b-4 border-gold bg-navy text-white">
        <div className="container-page py-8 sm:py-12 lg:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">The Houses</p>
          <h1 className="mt-2 text-3xl font-medium sm:text-4xl lg:text-5xl">Our Brands</h1>
        </div>
      </section>

      <div className="container-page pt-8 sm:pt-12">
        {brands.length === 0 ? (
          <p className="py-16 text-center text-navy/60">No brands available yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {brands.map((brand) => (
              <li key={brand._id}>
                <Link
                  href={`/perfumes?brand=${brand.slug}`}
                  className="group flex aspect-square flex-col items-center justify-center gap-4 border border-navy/10 bg-surface p-4 text-center transition-all hover:border-gold hover:shadow-lg"
                >
                  {brand.logo ? (
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                      <Image
                        src={brand.logo.url}
                        alt={brand.name}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center bg-navy font-serif text-2xl font-bold text-gold sm:h-20 sm:w-20 sm:text-3xl">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                  <span className="font-serif text-base group-hover:text-gold-dark sm:text-lg">
                    {brand.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}