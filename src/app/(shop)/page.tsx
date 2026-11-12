import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, CreditCard, QrCode, ScanLine, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { serverFetch } from '@/lib/server-api';
import { getPublicSettings } from '@/lib/settings';
import { deliveryHeadline } from '@/lib/delivery';
import { absoluteUrl } from '@/lib/site';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/constants';
import { ProductRail, SectionHeading } from '@/components/home/product-rail';
import { JsonLd } from '@/components/seo/json-ld';
import type { Brand, Category, Paginated, PerfumeCard } from '@/types';

export const metadata: Metadata = { alternates: { canonical: '/' } };

const list = (path: string) =>
  serverFetch<Paginated<PerfumeCard>>(path, { revalidate: 120 })
    .then((r) => r.data)
    .catch(() => [] as PerfumeCard[]);

export default async function HomePage() {
  const [featured, newest, bestSellers, topRated, brands, categories, settings] = await Promise.all([
    list('/perfumes?featured=true&sort=featured&limit=8'),
    list('/perfumes?sort=newest&limit=8'),
    list('/perfumes?sort=best_selling&limit=8'),
    list('/perfumes?sort=top_rated&limit=8'),
    serverFetch<Brand[]>('/brands', { revalidate: 300 }).catch(() => [] as Brand[]),
    serverFetch<Category[]>('/categories', { revalidate: 300 }).catch(() => [] as Category[]),
    getPublicSettings(),
  ]);

  const hero = [...featured, ...newest].find((p) => p.images?.length);
  const delivery = deliveryHeadline(settings.delivery);
  const rated = topRated.filter((p) => (p.ratingCount ?? 0) > 0);
  const selling = bestSellers.filter((p) => p.totalSold > 0);

  const TRUST = [
    { icon: ShieldCheck, title: '100% Authentic', text: 'Sourced from trusted distributors only.' },
    { icon: QrCode, title: 'QR Verified', text: 'Scan any bottle to confirm it’s genuine.' },
    { icon: Truck, title: delivery.title, text: delivery.text },
    { icon: CreditCard, title: 'Secure payment', text: 'Paystack or direct bank transfer.' },
  ];

  const instagram = settings.contact.instagram?.replace(/^@/, '');

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: SITE_NAME,
          description: SITE_DESCRIPTION,
          url: absoluteUrl('/'),
          ...(settings.contact.phone ? { telephone: settings.contact.phone } : {}),
          ...(settings.contact.email ? { email: settings.contact.email } : {}),
          ...(settings.contact.address ? { address: { '@type': 'PostalAddress', streetAddress: settings.contact.address, addressCountry: 'NG' } } : {}),
          ...(instagram ? { sameAs: [`https://instagram.com/${instagram}`] } : {}),
        }}
      />

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden border-b-4 border-gold bg-navy text-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-gold/10" />
        <div className="container-page relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold sm:text-sm">The Fragrance Gallery</p>
            <h1 className="mt-4 text-4xl font-medium leading-[1.1] xs:text-5xl sm:text-6xl xl:text-7xl">
              Find the scent that <span className="italic text-gold">defines</span> you.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base lg:mx-0">
              Designer and niche perfumes, carefully curated. Explore every note, compare sizes, and order in minutes —
              every bottle QR-verified.
            </p>
            <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:justify-center lg:justify-start">
              <Link href="/perfumes" className="inline-flex h-12 items-center justify-center bg-gold px-8 text-sm font-semibold uppercase tracking-wider text-navy transition-colors hover:bg-gold-light sm:h-14">
                Shop the collection
              </Link>
              <Link href="/brands" className="inline-flex h-12 items-center justify-center border border-gold px-8 text-sm font-semibold uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-navy sm:h-14">
                Browse brands
              </Link>
            </div>
          </div>

          {hero ? (
            <Link href={`/perfumes/${hero.slug}`} className="group relative mx-auto w-full max-w-[300px] xs:max-w-sm lg:max-w-md">
              <div className="absolute -right-3 -top-3 h-full w-full border-2 border-gold sm:-right-5 sm:-top-5" />
              <div className="relative aspect-[4/5] overflow-hidden bg-white">
                <Image src={hero.images[0].url} alt={hero.name} fill priority sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute -bottom-5 left-4 right-4 bg-white p-4 text-navy shadow-xl sm:left-6 sm:right-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark">{hero.brand?.name}</p>
                <p className="truncate font-serif text-lg">{hero.name}</p>
              </div>
            </Link>
          ) : (
            <div className="relative mx-auto aspect-square w-full max-w-[280px] xs:max-w-sm lg:max-w-md">
              <div className="absolute inset-0 rounded-full border-2 border-gold/60" />
              <div className="absolute inset-12 flex items-center justify-center rounded-full bg-gold sm:inset-20">
                <span className="font-serif text-5xl italic text-navy sm:text-6xl">P.</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== Trust strip ===== */}
      <section className="border-b border-navy/10 bg-surface">
        <ul className="container-page grid grid-cols-1 gap-6 py-8 xs:grid-cols-2 lg:grid-cols-4 lg:py-10">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-navy text-gold">
                <Icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-navy/60">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <ProductRail eyebrow="Hand-picked" title="Featured fragrances" href="/perfumes?featured=true&sort=featured" perfumes={featured} />

      {/* ===== Shop by family ===== */}
      {categories.length > 0 && (
        <section className="bg-surface py-12 sm:py-16">
          <div className="container-page">
            <SectionHeading eyebrow="Explore" title="Shop by fragrance family" href="/perfumes" linkLabel="All perfumes" />
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
              {categories.slice(0, 12).map((c) => (
                <li key={c._id}>
                  <Link href={`/perfumes?category=${c.slug}`} className="group relative flex aspect-square flex-col items-center justify-end overflow-hidden bg-navy p-3 text-center">
                    {c.image ? (
                      <Image src={c.image.url} alt="" fill sizes="(min-width: 1024px) 16vw, 45vw" className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center font-serif text-6xl italic text-gold/30">{c.name.charAt(0)}</span>
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
                    <span className="relative font-serif text-lg text-white group-hover:text-gold sm:text-xl">{c.name}</span>
                    <span className="relative mt-1 h-0.5 w-8 bg-gold transition-all group-hover:w-14" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ProductRail eyebrow="Just in" title="New arrivals" href="/perfumes?sort=newest" perfumes={newest} />

      {/* ===== QR authenticity ===== */}
      <section className="border-y-4 border-gold bg-navy text-white">
        <div className="container-page grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Authenticity guaranteed</p>
            <h2 className="mt-3 text-3xl font-medium sm:text-4xl">Every bottle has a QR code. Scan it.</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
              Fakes are everywhere. That’s why each perfume we sell carries a unique QR sticker that opens its official page on
              our website — so you always know it came from us.
            </p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Sparkles, title: 'Find the sticker', text: 'Look for our gold QR sticker on the box or bottle.' },
              { icon: Camera, title: 'Scan with your phone', text: 'Open your camera and point it at the code.' },
              { icon: ScanLine, title: 'See the official page', text: 'You land on this exact product on our website.' },
            ].map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="border border-gold/40 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-gold font-bold text-navy">{i + 1}</span>
                  <Icon size={20} className="text-gold" />
                </div>
                <p className="mt-4 font-semibold text-gold">{title}</p>
                <p className="mt-1 text-sm text-white/70">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {selling.length > 0 && <ProductRail eyebrow="Customer favourites" title="Best sellers" href="/perfumes?sort=best_selling" perfumes={selling} />}
      {rated.length > 0 && <ProductRail eyebrow="Loved by buyers" title="Top rated" href="/perfumes?sort=top_rated" perfumes={rated} />}

      {/* ===== Brands strip ===== */}
      {brands.length > 0 && (
        <section className="border-t border-navy/10 py-12 sm:py-16">
          <div className="container-page">
            <SectionHeading eyebrow="The houses" title="Brands we carry" href="/brands" linkLabel="All brands" />
            <ul className="-mx-4 mt-8 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-5 lg:overflow-visible lg:px-0">
              {brands.slice(0, 12).map((b) => (
                <li key={b._id} className="w-36 shrink-0 snap-start lg:w-auto">
                  <Link href={`/perfumes?brand=${b.slug}`} className="group flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-navy/10 bg-surface p-3 transition-colors hover:border-gold">
                    {b.logo ? (
                      <div className="relative h-12 w-20">
                        <Image src={b.logo.url} alt={b.name} fill sizes="80px" className="object-contain" />
                      </div>
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center bg-navy font-serif text-xl text-gold">{b.name.charAt(0)}</span>
                    )}
                    <span className="truncate text-xs font-semibold uppercase tracking-wider group-hover:text-gold-dark">{b.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ===== Final CTA ===== */}
      <section className="bg-gold">
        <div className="container-page flex flex-col items-center gap-5 py-12 text-center text-navy sm:py-14 lg:flex-row lg:justify-between lg:text-left">
          <div>
            <h2 className="text-2xl font-medium sm:text-3xl">Not sure which scent to choose?</h2>
            <p className="mt-2 text-sm text-navy/75 sm:text-base">Tell us what you like — we’ll help you find your signature fragrance.</p>
          </div>
          <div className="flex w-full flex-col gap-3 xs:w-auto xs:flex-row">
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.number}?text=${encodeURIComponent(settings.whatsapp.message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center bg-navy px-8 text-sm font-semibold uppercase tracking-wider text-gold hover:bg-navy-light"
              >
                Chat on WhatsApp
              </a>
            )}
            <Link href="/contact" className="flex h-12 items-center justify-center border-2 border-navy px-8 text-sm font-semibold uppercase tracking-wider hover:bg-navy hover:text-gold">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}