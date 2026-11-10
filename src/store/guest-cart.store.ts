import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MAX_QUANTITY_PER_ITEM } from '@/lib/constants';

/**
 * Cart for visitors who are NOT logged in.
 * Stores product choices only (never auth data). Merged into the
 * server cart automatically after login, then cleared.
 */
export interface GuestCartItem {
  perfumeId: string;
  variantId: string;
  quantity: number;
  // display snapshot (server re-checks everything at merge/checkout)
  slug: string;
  name: string;
  brandName: string | null;
  image: string | null;
  size: number;
  price: number;
  compareAtPrice?: number;
  stock: number;
}

interface GuestCartState {
  items: GuestCartItem[];
  add: (item: GuestCartItem) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
}

export const useGuestCart = create<GuestCartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) => {
        if (item.stock <= 0) throw new Error(`${item.name} (${item.size}ml) is out of stock`);

        const existing = get().items.find((i) => i.variantId === item.variantId);
        const alreadyInBag = existing?.quantity ?? 0;
        const newQuantity = alreadyInBag + item.quantity;

        if (newQuantity > MAX_QUANTITY_PER_ITEM) {
          throw new Error(`You can only have up to ${MAX_QUANTITY_PER_ITEM} of this item`);
        }
        if (newQuantity > item.stock) {
          const extra = alreadyInBag ? ` — you already have ${alreadyInBag} in your bag` : '';
          throw new Error(`Only ${item.stock} left in stock${extra}`);
        }

        set({
          items: existing
            ? get().items.map((i) =>
                i.variantId === item.variantId ? { ...i, ...item, quantity: newQuantity } : i,
              )
            : [...get().items, item],
        });
      },

      setQuantity: (variantId, quantity) =>
        set({
          items: get().items.map((i) => {
            if (i.variantId !== variantId) return i;
            const limit = Math.max(1, Math.min(i.stock, MAX_QUANTITY_PER_ITEM));
            return { ...i, quantity: Math.min(Math.max(1, quantity), limit) };
          }),
        }),

      remove: (variantId) =>
        set({ items: get().items.filter((i) => i.variantId !== variantId) }),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'perfume-guest-cart',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);