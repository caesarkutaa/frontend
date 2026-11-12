import type { Metadata } from 'next';
import { PerfumeEditor } from '@/components/admin/perfume-editor';

export const metadata: Metadata = { title: 'Edit perfume' };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditPerfumePage({ params, searchParams }: Props) {
  const { id } = await params;
  const q = await searchParams;
  return <PerfumeEditor perfumeId={id} justCreated={q.created === '1'} />;
}