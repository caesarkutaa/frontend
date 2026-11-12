import type { Metadata } from 'next';
import { TaxonomyManager } from '@/components/admin/taxonomy-manager';

export const metadata: Metadata = { title: 'Categories' };

export default function AdminCategoriesPage() {
  return (
    <TaxonomyManager
      config={{ endpoint: 'categories', title: 'Categories', singular: 'Category', imageField: 'image', description: 'Fragrance families like Woody, Floral, Oud, Fresh.' }}
    />
  );
}