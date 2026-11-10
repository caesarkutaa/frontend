import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, QrCode, Truck } from 'lucide-react';
import { ApiError, serverFetch } from '@/lib/server-api';
import {
  CONCENTRATION_LABELS,
  GENDER_LABELS,
  LONGEVITY_LABELS,
  SILLAGE_LABELS,
} from '@/lib/labels';
import { ImageGallery } from '@/components/perfume/image-gallery';
import { PurchasePanel } from '@/components/perfume/purchase-panel';
import { NotesPyramid } from '@/components/perfume/notes-pyramid';
import { PerfumeTile, type PerfumeTileData } from '@/components/perfume/perfume-tile';
import type { Perfume } from '@/types';

type Params = Promise<{ slug: string }>;

async function getPerfume(slug: string): Promise<Perfume | null> {
  try {
    return await serverFetch<Perfume>(`/perfumes/slug/${encodeURIComponent(slug)}`, {
      revalidate: 30,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const perfume = await getPerfume(slug);
  if (!perfume) return { title: 'Perfume not found' };

  const title = `${perfume.name} by ${perfume.brand.name}`;
  const description = perfume.shortDescription ?? perfume.description.slice(0, 155);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: perfume.images[0] ? [{ url: perfume.images[0].url }] : [],
    },
  };
}

export default async function PerfumeDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const perfume = await getPerfume(slug);
  if (!perfume) notFound();

  const related = await serverFetch<PerfumeTileData[]>(
    `/perfumes/slug/${encodeURIComponent(slug)}/related?limit=4`,
    { revalidate: 120 },
  ).catch(() => [] as PerfumeTileData[]);

  const details: { label: string; value?: string; href?: string }[] = [
    { label: 'Brand', value: perfume.brand.name, href: `/perfumes?brand=${perfume.brand.slug}` },
    {
      label: 'Family',
      value: perfume.category?.name,
      href: perfume.category ? `/perfumes?category=${perfume.category.slug}` : undefined,
    },
    { label: 'Concentration', value: CONCENTRATION_LABELS[perfume.concentration] },
    { label: 'For', value: GENDER_LABELS[perfume.gender] },
    { label: 'Fragrance type', value: perfume.fragranceFamily },
    {
      label: 'Longevity',
      value: perfume.longevity ? LONGEVITY_LABELS[perfume.longevity] : undefined,
    },
    { label: 'Sillage', value: perfume.sillage ? SILLAGE_LABELS[perfume.sillage] : undefined },
  ];

  return (
    <div className="container-page pb-16 pt-5 sm:pb-24 sm:pt-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-5 sm:mb-8">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-navy/50">
          <li>
            <Link href="/" className="hover:text-gold-dark">
              Home
            </Link>
          </li>
          <ChevronRight size={12} className="text-gold" />
          <li>
            <Link href="/perfumes" className="hover:text-gold-dark">
              Shop
            </Link>
          </li>
          <ChevronRight size={12} className="text-gold" />
          <li>
            <Link href={`/perfumes?brand=${perfume.brand.slug}`} className="hover:text-gold-dark">
              {perfume.brand.name}
            </Link>
          </li>
          <ChevronRight size={12} className="text-gold" />
          <li className="max-w-[45vw] truncate font-medium text-navy">{perfume.name}</li>
        </ol>
      </nav>

      {/* Main */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-20">
        <ImageGallery images={perfume.images} name={perfume.name} />

        <div className="lg:py-2">
          <Link
            href={`/perfumes?brand=${perfume.brand.slug}`}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark hover:text-navy sm:text-sm"
          >
            {perfume.brand.name}
          </Link>
          <h1 className="mt-2 text-3xl font-medium leading-tight sm:text-4xl xl:text-5xl">
            {perfume.name}
          </h1>
          <p className="mt-2 text-sm text-navy/60">
            {CONCENTRATION_LABELS[perfume.concentration]} · {GENDER_LABELS[perfume.gender]}
          </p>
          <div className="mt-4 h-0.5 w-14 bg-gold" />

          {perfume.shortDescription && (
            <p className="mt-5 text-sm leading-relaxed text-navy/75 sm:text-base">
              {perfume.shortDescription}
            </p>
          )}

          <div className="mt-6 sm:mt-8">
            <PurchasePanel
              perfume={{
                _id: perfume._id,
                slug: perfume.slug,
                name: perfume.name,
                brandName: perfume.brand.name,
                images: perfume.images,
                variants: perfume.variants,
              }}
            />
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex gap-3 bg-navy p-4 text-white">
              <QrCode size={22} className="mt-0.5 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-semibold text-gold">Official product page</p>
                <p className="mt-1 text-xs leading-relaxed text-white/75">
                  If you scanned the QR code on your bottle and landed here, your perfume is a
                  genuine product from our store.
                </p>
              </div>
            </div>
            <div className="flex gap-3 border border-gold/60 bg-gold/10 p-4">
              <Truck size={22} className="mt-0.5 shrink-0 text-gold-dark" />
              <div>
                <p className="text-sm font-semibold">Free delivery</p>
                <p className="mt-1 text-xs text-navy/60">On every order, no minimum.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description + details */}
      <section className="mt-14 grid gap-10 border-t border-navy/10 pt-10 sm:mt-20 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">
            The story
          </p>
          <h2 className="mt-2 text-2xl font-medium sm:text-3xl">About this fragrance</h2>
          <div className="mt-3 h-0.5 w-14 bg-gold" />
          <div className="mt-5 whitespace-pre-line text-sm leading-relaxed text-navy/75 sm:text-base">
            {perfume.description}
          </div>
        </div>

        <div className="border-t-4 border-gold bg-surface p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">
            At a glance
          </p>
          <h2 className="mt-2 text-2xl font-medium sm:text-3xl">Details</h2>
          <dl className="mt-5 divide-y divide-navy/10">
            {details
              .filter((d) => d.value)
              .map((d) => (
                <div key={d.label} className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-navy/55">{d.label}</dt>
                  <dd className="text-right font-semibold">
                    {d.href ? (
                      <Link
                        href={d.href}
                        className="underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark"
                      >
                        {d.value}
                      </Link>
                    ) : (
                      d.value
                    )}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      </section>

      <NotesPyramid notes={perfume.notes} />

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14 border-t border-navy/10 pt-10 sm:mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">
                Discover more
              </p>
              <h2 className="mt-2 text-2xl font-medium sm:text-3xl">You may also like</h2>
            </div>
            <Link
              href="/perfumes"
              className="shrink-0 text-xs font-semibold uppercase tracking-wider underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark"
            >
              View all
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-4">
            {related.map((item) => (
              <li key={item._id}>
                <PerfumeTile perfume={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}