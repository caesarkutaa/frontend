'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Download, ExternalLink, Pencil, Plus } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { formatNaira } from '@/lib/utils';
import { buttonClasses } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { ActiveBadge, AdminPagination, AdminTitle, EmptyRow, ErrorBox, FilterSelect, SearchBox, TableHead, TableWrap, td } from './admin-ui';
import type { Paginated, Perfume } from '@/types';

/** Cloudinary URL that forces download */
export const qrDownloadHref = (url: string, slug: string) => url.replace('/upload/', `/upload/fl_attachment:qr-${slug}/`);

export function PerfumesTable({ initialLowStock = false }: { initialLowStock?: boolean }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [lowStock, setLowStock] = useState(initialLowStock);
  const [page, setPage] = useState(1);

  const params = { page, limit: 15, ...(search && { search }), ...(status && { isActive: status }), ...(lowStock && { lowStock: 'true' }) };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-perfumes', params],
    queryFn: async () => (await api.get<Paginated<Perfume>>('/perfumes/admin', { params })).data,
  });

  return (
    <div>
      <AdminTitle
        title="Perfumes"
        description="Each perfume gets a QR code automatically when created."
        actions={
          <Link href="/admin/perfumes/new" className={buttonClasses({ variant: 'gold' })}>
            <Plus size={16} /> Add perfume
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Name, slug or SKU..." />
        <FilterSelect label="Visibility" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Hidden' }]} />
        <label className="flex h-10 cursor-pointer items-center gap-2 border border-navy/20 bg-white px-3 text-sm">
          <input type="checkbox" checked={lowStock} onChange={(e) => { setLowStock(e.target.checked); setPage(1); }} className="h-4 w-4 accent-navy" />
          Low stock only
        </label>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorBox message={getErrorMessage(error)} />
      ) : (
        <>
          <TableWrap>
            <TableHead columns={['Perfume', 'Category', 'Price', 'Stock', 'Status', 'QR', '']} />
            <tbody className="divide-y divide-navy/10">
              {data?.data.length === 0 && <EmptyRow colSpan={7} message="No perfumes found" />}
              {data?.data.map((p) => {
                const prices = p.variants.map((v) => v.price);
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                return (
                  <tr key={p._id} className="hover:bg-surface">
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-surface">
                          {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="40px" className="object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-dark">{p.brand?.name}</p>
                          <p className="max-w-[220px] truncate font-medium">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className={td}>{p.category?.name ?? '—'}</td>
                    <td className={`${td} whitespace-nowrap`}>{min === max ? formatNaira(min) : `${formatNaira(min)} – ${formatNaira(max)}`}</td>
                    <td className={td}>
                      <span className={stock === 0 ? 'font-bold text-error' : stock <= 5 ? 'font-bold text-gold-dark' : 'font-semibold'}>{stock}</span>
                      <span className="text-xs text-navy/50"> · {p.variants.length} size{p.variants.length > 1 ? 's' : ''}</span>
                    </td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-1">
                        <ActiveBadge active={p.isActive} />
                        {p.isFeatured && <span className="border border-gold bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-gold-dark">Featured</span>}
                      </div>
                    </td>
                    <td className={td}>
                      {p.qrCode?.url ? (
                        <a href={qrDownloadHref(p.qrCode.url, p.slug)} className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-gold-dark hover:text-navy">
                          <Download size={14} /> PNG
                        </a>
                      ) : (
                        <span className="text-xs text-navy/40">—</span>
                      )}
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/perfumes/${p._id}`} className="inline-flex items-center gap-1 bg-navy px-3 py-1.5 text-xs font-semibold uppercase text-gold hover:bg-gold hover:text-navy">
                          <Pencil size={12} /> Edit
                        </Link>
                        <a href={`/perfumes/${p.slug}`} target="_blank" rel="noopener noreferrer" aria-label="View on site" className="flex h-8 w-8 items-center justify-center text-navy/50 hover:text-gold-dark">
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
          <AdminPagination meta={data?.meta} onPage={setPage} />
        </>
      )}
    </div>
  );
}