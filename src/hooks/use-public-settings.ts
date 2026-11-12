'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PublicSettings } from '@/types/settings';

/** Client-side settings (checkout delivery fees, etc.) */
export function usePublicSettings() {
  return useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => (await api.get<PublicSettings>('/settings/public')).data,
    staleTime: 60_000,
  });
}