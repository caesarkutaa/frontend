'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useGuestCart } from '@/store/guest-cart.store';
import { CART_QUERY_KEY } from '@/hooks/use-cart';
import type { Cart } from '@/types';

function AuthBootstrap() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const setGuest = useAuthStore((s) => s.setGuest);

  useEffect(() => {
    fetchMe();

    // Fired by the axios client when the session expires or the user is blocked
    const handleExpired = () => setGuest();
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [fetchMe, setGuest]);

  return null;
}

/**
 * - After login/register: merges the guest (localStorage) cart into the server cart.
 * - After logout: drops the cached server cart.
 */
function CartSync() {
  const status = useAuthStore((s) => s.status);
  const queryClient = useQueryClient();
  const merging = useRef(false);

  useEffect(() => {
    if (status === 'guest') {
      queryClient.removeQueries({ queryKey: CART_QUERY_KEY });
      return;
    }

    if (status !== 'authenticated' || merging.current) return;

    const guestItems = useGuestCart.getState().items;
    if (!guestItems.length) return;

    merging.current = true;
    api
      .post<Cart>('/cart/merge', {
        items: guestItems.map(({ perfumeId, variantId, quantity }) => ({
          perfumeId,
          variantId,
          quantity,
        })),
      })
      .then(({ data }) => {
        useGuestCart.getState().clear();
        queryClient.setQueryData(CART_QUERY_KEY, data);
        toast.success('Items from your bag were saved to your account');
      })
      .catch(() => {
        /* keep guest items; it will retry on next login */
      })
      .finally(() => {
        merging.current = false;
      });
  }, [status, queryClient]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <CartSync />
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0b1f3a', // navy
            color: '#ffffff',
            border: '1px solid #c9a227', // gold
            borderRadius: 0,
            fontSize: '14px',
            maxWidth: '92vw',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
        }}
      />
    </QueryClientProvider>
  );
}