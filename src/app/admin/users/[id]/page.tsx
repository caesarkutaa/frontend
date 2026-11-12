import type { Metadata } from 'next';
import { UserDetail } from '@/components/admin/user-detail';

export const metadata: Metadata = { title: 'User' };

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetail userId={id} />;
}