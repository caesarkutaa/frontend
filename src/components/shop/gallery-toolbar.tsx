'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useFilterParams } from '@/hooks/use-filter-params';
import { SORT_OPTIONS } from '@/lib/labels';
import { MobileFilters } from './gallery-filters';
import type { Brand, Category } from '@/types';

interface GalleryToolbarProps {
  total: number;
  brands: Brand[];
  categories: Category[];
}

export function GalleryToolbar({ total, brands, categories }: GalleryToolbarProps) {
  const { searchParams, update } = useFilterParams();
  const urlSearch = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const autoFocus = searchParams.get('focus') === 'search';

  const [search, setSearch] = useState(urlSearch);

  // Sync input when URL changes from elsewhere
  useEffect(() => setSearch(urlSearch), [urlSearch]);

  // Debounced search -> URL
  useEffect(() => {
    if (search.trim() === urlSearch) return;
    const timer = setTimeout(() => update({ search: search.trim() || null }), 400);
    return () => clearTimeout(timer);
  }, [search, urlSearch, update]);

  return (
    <div className="mb-6 space-y-3 sm:mb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs lg:max-w-sm">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gold-dark"
          />
          <input
            type="search"
            value={search}
            autoFocus={autoFocus}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search perfume, brand or note..."
            aria-label="Search perfumes"
            className="h-11 w-full border border-navy/20 bg-white pl-10 pr-10 text-sm text-navy outline-none placeholder:text-navy/35 focus:border-gold"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-navy/40 hover:text-navy"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters (mobile) + Sort */}
        <div className="flex gap-2">
          <MobileFilters total={total} brands={brands} categories={categories} />
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value === 'newest' ? null : e.target.value })}
            aria-label="Sort perfumes"
            className="h-11 min-w-0 flex-1 border border-navy/20 bg-white px-3 text-sm text-navy outline-none focus:border-gold sm:flex-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs uppercase tracking-wider text-navy/55">
        <span className="font-bold text-navy">{total}</span>{' '}
        {total === 1 ? 'perfume' : 'perfumes'}
      </p>
    </div>
  );
}