'use client';

import { useRouter } from 'next/navigation';
import { AdminTitle, Panel } from '@/components/admin/admin-ui';
import { PerfumeForm } from '@/components/admin/perfume-form';

export default function NewPerfumePage() {
  const router = useRouter();
  return (
    <div>
      <AdminTitle title="Add perfume" description="A QR code is generated automatically when you save." />
      <Panel>
        <PerfumeForm mode="create" onSaved={(p) => router.replace(`/admin/perfumes/${p._id}?created=1`)} />
      </Panel>
    </div>
  );
}