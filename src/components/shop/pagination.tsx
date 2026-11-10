import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string>;
}

function getPages(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'gap')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push('gap');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push('gap');
  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, basePath, params }: PaginationProps) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const qs = new URLSearchParams(params);
    if (p > 1) qs.set('page', String(p));
    else qs.delete('page');
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  const navButton =
    'flex h-11 items-center gap-1 border border-navy px-3 text-xs font-semibold uppercase tracking-wider text-navy sm:px-4';

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-between gap-2 sm:justify-center"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(navButton, 'hover:bg-navy hover:text-gold')}>
          <ChevronLeft size={16} /> <span className="hidden xs:inline">Prev</span>
        </Link>
      ) : (
        <span className={cn(navButton, 'opacity-30')}>
          <ChevronLeft size={16} /> <span className="hidden xs:inline">Prev</span>
        </span>
      )}

      {/* Mobile: compact */}
      <span className="text-sm text-navy/70 sm:hidden">
        Page <span className="font-bold text-navy">{page}</span> of {totalPages}
      </span>

      {/* Tablet & up: numbers */}
      <ul className="hidden items-center gap-1 sm:flex">
        {getPages(page, totalPages).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} className="px-2 text-navy/40">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={href(p)}
                aria-current={p === page ? 'page' : undefined}
                className={cn(
                  'flex h-11 w-11 items-center justify-center text-sm font-semibold',
                  p === page ? 'bg-navy text-gold' : 'text-navy hover:bg-gold/20',
                )}
              >
                {p}
              </Link>
            </li>
          ),
        )}
      </ul>

      {page < totalPages ? (
        <Link href={href(page + 1)} className={cn(navButton, 'hover:bg-navy hover:text-gold')}>
          <span className="hidden xs:inline">Next</span> <ChevronRight size={16} />
        </Link>
      ) : (
        <span className={cn(navButton, 'opacity-30')}>
          <span className="hidden xs:inline">Next</span> <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}