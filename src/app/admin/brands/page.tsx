import type { Metadata } from 'next';
import { TaxonomyManager } from '@/components/admin/taxonomy-manager';

export const metadata: Metadata = { title: 'Brands' };

export default function AdminBrandsPage() {
  return (
    <TaxonomyManager
      config={{ endpoint: 'brands', title: 'Brands', singular: 'Brand', imageField: 'logo', description: 'Perfume houses shown in filters and on the Brands page.' }}
    />
  );
}