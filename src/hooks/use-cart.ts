'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { MAX_QUANTITY_PER_ITEM } from '@/lib/constants';
import { useAuthStore } from '@/store/auth.store';
import { useGuestCart, type GuestCartItem } from '@/store/guest-cart.store';
import type { Cart, CartItem } from '@/types';

export const CART_QUERY_KEY = ['cart'] as const;

/** One shape for both guest and server carts, so the UI doesn't care which */
export interface CartLine {
  key: string; // server item _id, or variantId for guests
  perfumeId: string;
  variantId: string;
  slug: string;
  name: string;
  brandName: string | null;
  image: string | null;
  size: number;
  unitPrice: number;
  compareAtPrice?: number;
  quantity: number;
  maxQuantity: number;
  inStock: boolean;
  subtotal: number;
}

export interface AddToCartInput {
  perfumeId: string;
  variantId: string;
  quantity: number;
  snapshot: Omit<GuestCartItem, 'perfumeId' | 'variantId' | 'quantity'>;
}

const serverToLine = (item: CartItem): CartLine => ({
  key: item._id,
  perfumeId: item.perfume._id,
  variantId: item.variant._id,
  slug: item.perfume.slug,
  name: item.perfume.name,
  brandName: item.perfume.brand?.name ?? null,
  image: item.perfume.image,
  size: item.variant.size,
  unitPrice: item.unitPrice,
  compareAtPrice: item.variant.compareAtPrice,
  quantity: item.quantity,
  maxQuantity: item.maxQuantity,
  inStock: item.inStock,
  subtotal: item.subtotal,
});

const guestToLine = (item: GuestCartItem): CartLine => ({
  key: item.variantId,
  perfumeId: item.perfumeId,
  variantId: item.variantId,
  slug: item.slug,
  name: item.name,
  brandName: item.brandName,
  image: item.image,
  size: item.size,
  unitPrice: item.price,
  compareAtPrice: item.compareAtPrice,
  quantity: item.quantity,
  maxQuantity: Math.min(item.stock, MAX_QUANTITY_PER_ITEM),
  inStock: item.stock > 0,
  subtotal: item.stock > 0 ? item.price * item.quantity : 0,
});

export function useCart() {
  const status = useAuthStore((s) => s.status);
  const isAuthed = status === 'authenticated';
  const authResolved = status === 'authenticated' || status === 'guest';
  const queryClient = useQueryClient();

  // Avoid SSR/localStorage mismatch: guest items only after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const guestItems = useGuestCart((s) => s.items);
  const addGuest = useGuestCart((s) => s.add);
  const setGuestQuantity = useGuestCart((s) => s.setQuantity);
  const removeGuest = useGuestCart((s) => s.remove);
  const clearGuest = useGuestCart((s) => s.clear);

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => (await api.get<Cart>('/cart')).data,
    enabled: isAuthed,
  });

  const applyServerCart = (cart: Cart) => {
    queryClient.setQueryData(CART_QUERY_KEY, cart);
    cart.notices?.forEach((notice) => toast(notice, { icon: 'ℹ️' }));
  };

  const addMutation = useMutation({
    mutationFn: async (body: { perfumeId: string; variantId: string; quantity: number }) =>
      (await api.post<Cart>('/cart/items', body)).data,
    onSuccess: applyServerCart,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      (await api.patch<Cart>(`/cart/items/${itemId}`, { quantity })).data,
    onSuccess: applyServerCart,
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => (await api.delete<Cart>(`/cart/items/${itemId}`)).data,
    onSuccess: applyServerCart,
  });

  const clearMutation = useMutation({
    mutationFn: async () => (await api.delete<Cart>('/cart')).data,
    onSuccess: applyServerCart,
  });

  const lines: CartLine[] = useMemo(() => {
    if (isAuthed) return (cartQuery.data?.items ?? []).map(serverToLine);
    return mounted ? guestItems.map(guestToLine) : [];
  }, [isAuthed, cartQuery.data, mounted, guestItems]);

  const summary = useMemo(
    () => ({
      itemCount: lines.length,
      totalQuantity: lines.reduce((sum, l) => sum + (l.inStock ? l.quantity : 0), 0),
      subtotal: lines.reduce((sum, l) => sum + l.subtotal, 0),
      hasUnavailableItems: lines.some((l) => !l.inStock),
    }),
    [lines],
  );

  /* ---------- Actions ---------- */
  const addItem = async (input: AddToCartInput) => {
    if (isAuthed) {
      await addMutation.mutateAsync({
        perfumeId: input.perfumeId,
        variantId: input.variantId,
        quantity: input.quantity,
      });
    } else {
      addGuest({
        perfumeId: input.perfumeId,
        variantId: input.variantId,
        quantity: input.quantity,
        ...input.snapshot,
      });
    }
  };

  const updateQuantity = async (line: CartLine, quantity: number) => {
    if (isAuthed) await updateMutation.mutateAsync({ itemId: line.key, quantity });
    else setGuestQuantity(line.variantId, quantity);
  };

  const removeItem = async (line: CartLine) => {
    if (isAuthed) await removeMutation.mutateAsync(line.key);
    else removeGuest(line.variantId);
  };

  const clear = async () => {
    if (isAuthed) await clearMutation.mutateAsync();
    else clearGuest();
  };

  return {
    lines,
    summary,
    notices: isAuthed ? (cartQuery.data?.notices ?? []) : [],
    isAuthed,
    isLoading: !authResolved || !mounted || (isAuthed && cartQuery.isLoading),
    isMutating:
      addMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending ||
      clearMutation.isPending,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    addItem,
    updateQuantity,
    removeItem,
    clear,
  };
}