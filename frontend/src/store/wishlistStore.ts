import { create } from "zustand";
import type { Product } from "@mohini-artistry/shared";
import { wishlistApi } from "../api/wishlist";
import { useAuthStore } from "./authStore";

interface WishlistState {
  productIds: Set<number>;
  items: Product[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggle: (productId: number) => Promise<void>;
  isWishlisted: (productId: number) => boolean;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: new Set(),
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    set({ isLoading: true });
    try {
      const items = await wishlistApi.list();
      set({ items, productIds: new Set(items.map((p) => p.id)), isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggle: async (productId) => {
    if (!useAuthStore.getState().isAuthenticated) return;
    const currentlyIn = get().productIds.has(productId);
    set((s) => {
      const next = new Set(s.productIds);
      if (currentlyIn) next.delete(productId);
      else next.add(productId);
      return { productIds: next };
    });
    try {
      if (currentlyIn) await wishlistApi.remove(productId);
      else await wishlistApi.add(productId);
      await get().fetchWishlist();
    } catch {
      // Revert the optimistic update on failure.
      set((s) => {
        const next = new Set(s.productIds);
        if (currentlyIn) next.add(productId);
        else next.delete(productId);
        return { productIds: next };
      });
    }
  },

  isWishlisted: (productId) => get().productIds.has(productId),

  reset: () => set({ productIds: new Set(), items: [] }),
}));
