'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useFilterParams } from '@/hooks/use-filter-params';
import { CONCENTRATION_LABELS, GENDER_LABELS } from '@/lib/labels';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Brand, Category, Concentration } from '@/types';

const FILTER_KEYS = ['brand', 'category', 'gender', 'concentration', 'minPrice', 'maxPrice', 'inStock'];

const fieldClass =
  'h-11 w-full border border-navy/20 bg-white px-3 text-sm text-navy outline-none placeholder:text-navy/35 focus:border-gold';

interface FilterProps {
  brands: Brand[];
  categories: Category[];
}

/* ---------------- Shared panel (used by sidebar and mobile sheet) ---------------- */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-navy/10 py-5 first:pt-0">
      <h3 className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.2em] text-navy">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FilterPanel({ brands, categories }: FilterProps) {
  const { searchParams, update, clearAll } = useFilterParams();

  const selectedBrands = searchParams.get('brand')?.split(',').filter(Boolean) ?? [];
  const selectedCategories = searchParams.get('category')?.split(',').filter(Boolean) ?? [];
  const gender = searchParams.get('gender') ?? '';
  const concentration = searchParams.get('concentration') ?? '';
  const inStock = searchParams.get('inStock') === 'true';

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');

  // Keep price inputs in sync when URL changes (e.g. "Clear all")
  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') ?? '');
    setMaxPrice(searchParams.get('maxPrice') ?? '');
  }, [searchParams]);

  const toggleInList = (key: 'brand' | 'category', list: string[], slug: string) => {
    const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
    update({ [key]: next.join(',') || null });
  };

  const applyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    update({ minPrice: minPrice || null, maxPrice: maxPrice || null });
  };

  const activeCount = FILTER_KEYS.filter((k) => searchParams.get(k)).length;
  const genderOptions = [
    { value: '', label: 'All' },
    ...Object.entries(GENDER_LABELS).map(([value, label]) => ({ value, label })),
  ];

  return (
    <div>
      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="mb-5 text-xs font-semibold uppercase tracking-wider text-gold-dark underline underline-offset-4 hover:text-navy"
        >
          Clear all filters ({activeCount})
        </button>
      )}

      <FilterSection title="Gender">
        <div className="space-y-2.5">
          {genderOptions.map((option) => (
            <label
              key={option.value || 'all'}
              className="flex cursor-pointer items-center gap-3 text-sm text-navy/85 hover:text-gold-dark"
            >
              <input
                type="radio"
                name="gender"
                checked={gender === option.value}
                onChange={() => update({ gender: option.value || null })}
                className="h-4 w-4 accent-navy"
              />
              {option.label}
            </label>
          ))}
        </div>
      </FilterSection>

      {brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="max-h-56 space-y-2.5 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <label
                key={brand._id}
                className="flex cursor-pointer items-center gap-3 text-sm text-navy/85 hover:text-gold-dark"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.slug)}
                  onChange={() => toggleInList('brand', selectedBrands, brand.slug)}
                  className="h-4 w-4 accent-navy"
                />
                <span className="truncate">{brand.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {categories.length > 0 && (
        <FilterSection title="Fragrance family">
          <div className="max-h-56 space-y-2.5 overflow-y-auto pr-1">
            {categories.map((category) => (
              <label
                key={category._id}
                className="flex cursor-pointer items-center gap-3 text-sm text-navy/85 hover:text-gold-dark"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.slug)}
                  onChange={() => toggleInList('category', selectedCategories, category.slug)}
                  className="h-4 w-4 accent-navy"
                />
                <span className="truncate">{category.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Concentration">
        <select
          value={concentration}
          onChange={(e) => update({ concentration: e.target.value || null })}
          className={fieldClass}
        >
          <option value="">Any concentration</option>
          {(Object.entries(CONCENTRATION_LABELS) as [Concentration, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ),
          )}
        </select>
      </FilterSection>

      <FilterSection title="Price (₦)">
        <form onSubmit={applyPrice} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className={fieldClass}
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className={fieldClass}
            />
          </div>
          <Button type="submit" variant="outline" size="sm" fullWidth>
            Apply price
          </Button>
        </form>
      </FilterSection>

      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-navy/85 hover:text-gold-dark">
          <input
            type="checkbox"
            checked={inStock}
            onChange={() => update({ inStock: inStock ? null : 'true' })}
            className="h-4 w-4 accent-navy"
          />
          In stock only
        </label>
      </FilterSection>
    </div>
  );
}

/* ---------------- Desktop sidebar ---------------- */
export function GalleryFiltersSidebar(props: FilterProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto border-t-4 border-gold bg-surface p-5 pb-8">
        <FilterPanel {...props} />
      </div>
    </aside>
  );
}

/* ---------------- Mobile: button + slide-up sheet ---------------- */
export function MobileFilters({ total, ...props }: FilterProps & { total: number }) {
  const [open, setOpen] = useState(false);
  const { searchParams } = useFilterParams();
  const activeCount = FILTER_KEYS.filter((k) => searchParams.get(k)).length;

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center gap-2 bg-navy px-4 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-navy lg:hidden"
      >
        <SlidersHorizontal size={16} />
        Filters
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-navy">
            {activeCount}
          </span>
        )}
      </button>

      <div
        className={cn('fixed inset-0 z-50 lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-navy-dark/60 transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div
          role="dialog"
          aria-label="Filters"
          className={cn(
            'absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col bg-white transition-transform duration-300',
            open ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="flex items-center justify-between border-b-2 border-gold bg-navy px-4 py-4 sm:px-6">
            <h2 className="font-serif text-xl text-gold">Filters</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="flex h-10 w-10 items-center justify-center text-white hover:text-gold"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <FilterPanel {...props} />
          </div>

          <div className="border-t border-navy/10 p-4 sm:px-6">
            <Button size="lg" fullWidth onClick={() => setOpen(false)}>
              Show {total} {total === 1 ? 'result' : 'results'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}