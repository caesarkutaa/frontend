import { serverFetch } from './server-api';
import type { PublicSettings } from '@/types/settings';

export const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  announcement: null,
  whatsapp: null,
  contact: {},
  delivery: { defaultFee: 0, freeShippingMin: 0, stateFees: [] },
};

/** Server-side: store settings (refreshed instantly when the admin saves) */
export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    return await serverFetch<PublicSettings>('/settings/public', { revalidate: 3600 });
  } catch {
    return DEFAULT_PUBLIC_SETTINGS;
  }
}