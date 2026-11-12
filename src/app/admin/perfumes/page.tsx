import type { Metadata } from 'next';
import { PerfumesTable } from '@/components/admin/perfumes-table';

export const metadata: Metadata = { title: 'Perfumes' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminPerfumesPage({ searchParams }: { searchParams: SearchParams }) {
  const q = await searchParams;
  return <PerfumesTable initialLowStock={q.lowStock === 'true'} />;
}