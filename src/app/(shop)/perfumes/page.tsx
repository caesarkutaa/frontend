import type { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/server-api';
import { GALLERY_PAGE_SIZE } from '@/lib/constants';
import { GENDER_LABELS } from '@/lib/labels';
import { PerfumeTile } from '@/components/perfume/perfume-tile';
import { GalleryFiltersSidebar } from '@/components/shop/gallery-filters';
import { GalleryToolbar } from '@/components/shop/gallery-toolbar';
import { Pagination } from '@/components/shop/pagination';
import type { Brand, Category, Gender, Paginated, PerfumeCard } from '@/types';

export const metadata: Metadata = {
  title: 'Shop Perfumes',
  description: 'Browse authentic designer and niche perfumes by brand, family, gender and price.',
};

const ALLOWED_PARAMS = [
  'page',
  'search',
  'brand',
  'category',
  'gender',
  'concentration',
  'minPrice',
  'maxPrice',
  'inStock',
  'sort',
  'featured',
] as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PerfumesPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;

  // Flatten + whitelist query params
  const params: Record<string, string> = {};
  for (const key of ALLOWED_PARAMS) {
    const value = Array.isArray(raw[key]) ? raw[key]?.[0] : raw[key];
    if (value) params[key] = value;
  }

  const query = new URLSearchParams({ ...params, limit: String(GALLERY_PAGE_SIZE) });

  const [gallery, brands, categories] = await Promise.all([
    serverFetch<Paginated<PerfumeCard>>(`/perfumes?${query}`, { revalidate: 30 }).catch(() => null),
    serverFetch<Brand[]>('/brands', { revalidate: 300 }).catch(() => [] as Brand[]),
    serverFetch<Category[]>('/categories', { revalidate: 300 }).catch(() => [] as Category[]),
  ]);

  const singleBrand =
    params.brand && !params.brand.includes(',')
      ? brands.find((b) => b.slug === params.brand)
      : undefined;

  const heading = params.search
    ? `Results for “${params.search}”`
    : singleBrand
      ? singleBrand.name
      : params.gender
        ? `${GENDER_LABELS[params.gender as Gender] ?? ''} Fragrances`
        : 'All Fragrances';

  const perfumes = gallery?.data ?? [];
  const meta = gallery?.meta ?? { page: 1, limit: GALLERY_PAGE_SIZE, total: 0, totalPages: 0 };

  return (
    <div className="pb-16 sm:pb-24">
      {/* Header band — navy */}
      <section className="border-b-4 border-gold bg-navy text-white">
        <div className="container-page py-8 sm:py-12 lg:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            The Collection
          </p>
          <h1 className="mt-2 text-3xl font-medium sm:text-4xl lg:text-5xl">{heading}</h1>
          {singleBrand?.description && (
            <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
              {singleBrand.description}
            </p>
          )}
        </div>
      </section>

      <div className="container-page grid gap-8 pt-6 sm:pt-10 lg:grid-cols-[250px_1fr] xl:grid-cols-[270px_1fr] xl:gap-12">
        <GalleryFiltersSidebar brands={brands} categories={categories} />

        <div className="min-w-0">
          <GalleryToolbar total={meta.total} brands={brands} categories={categories} />

          {!gallery ? (
            <div className="border border-error/30 bg-error/10 p-6 text-center text-sm text-error">
              We couldn’t load perfumes right now. Please refresh the page.
            </div>
          ) : perfumes.length === 0 ? (
            <div className="flex flex-col items-center border-t-4 border-gold bg-surface px-6 py-16 text-center sm:py-24">
              <p className="font-serif text-2xl">No perfumes found</p>
              <p className="mt-2 max-w-sm text-sm text-navy/60">
                Try removing a filter or searching for something else.
              </p>
              <Link
                href="/perfumes"
                className="mt-6 inline-flex h-11 items-center bg-navy px-6 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-navy"
              >
                View all perfumes
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 2xl:grid-cols-4">
              {perfumes.map((perfume, i) => (
                <li key={perfume._id}>
                  <PerfumeTile perfume={perfume} priority={i < 4} />
                </li>
              ))}
            </ul>
          )}

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            basePath="/perfumes"
            params={params}
          />
        </div>
      </div>
    </div>
  );
}