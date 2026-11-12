'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useGuestCart } from '@/store/guest-cart.store';
import { CART_QUERY_KEY } from '@/hooks/use-cart';
import type { Cart } from '@/types';

/* ---------------- Auth bootstrap ---------------- */
function AuthBootstrap() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const setGuest = useAuthStore((s) => s.setGuest);

  useEffect(() => {
    fetchMe();

    const handleExpired = () => setGuest();
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [fetchMe, setGuest]);

  return null;
}

/* ---------------- Guest cart merge ---------------- */
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
        items: guestItems.map(({ perfumeId, variantId, quantity }) => ({ perfumeId, variantId, quantity })),
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

/* ---------------- Real-time updates (Server-Sent Events) ---------------- */
interface AppEvent {
  type: 'ping' | 'order.updated' | 'account.blocked' | 'account.updated';
  userId?: string;
  actorId?: string;
  orderId?: string;
  userMessage?: string;
  adminMessage?: string;
}

/** Every query that can be affected by an order change */
const ORDER_QUERY_PREFIXES = [
  ['orders'],
  ['admin-orders'],
  ['admin-payments'],
  ['admin-dashboard'],
  ['admin-users'],
  ['admin-perfumes'],
];

function RealtimeSync() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated' || !user) return;

    const refreshOrders = (orderId?: string) => {
      ORDER_QUERY_PREFIXES.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ['order', orderId] });
        queryClient.invalidateQueries({ queryKey: ['order-payment', orderId] });
        queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-user'] });
    };

    const source = new EventSource('/api/events/stream');
    let hasOpened = false;

    source.onopen = () => {
      // After a reconnect, catch up on anything missed while offline
      if (hasOpened) refreshOrders();
      hasOpened = true;
    };

    source.onmessage = (message) => {
      let event: AppEvent;
      try {
        event = JSON.parse(message.data);
      } catch {
        return;
      }

      const causedByMe = event.actorId === user.id;
      const isMine = event.userId === user.id;

      switch (event.type) {
        case 'ping':
          return;

        case 'order.updated': {
          refreshOrders(event.orderId);
          if (causedByMe) return;
          if (isMine && event.userMessage) toast(event.userMessage, { icon: '🛍️', duration: 6000 });
          else if (user.role === 'admin' && event.adminMessage) toast(event.adminMessage, { icon: '🔔', duration: 6000 });
          return;
        }

        case 'account.blocked': {
          source.close();
          logout().finally(() => {
            queryClient.clear();
            toast.error(
              event.userMessage ? `Your account has been blocked: ${event.userMessage}` : 'Your account has been blocked',
              { duration: 8000 },
            );
            router.replace('/login');
          });
          return;
        }

        case 'account.updated': {
          fetchMe(); // refresh role/name in the navbar & admin access
          if (event.userMessage) toast(event.userMessage, { icon: '👤' });
          return;
        }
      }
    };

    // EventSource reconnects by itself on network errors
    return () => source.close();
  }, [status, user, queryClient, router, fetchMe, logout]);

  return null;
}

/* ---------------- Providers ---------------- */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: true, // safety net: refresh when the tab becomes active again
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <CartSync />
      <RealtimeSync />
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