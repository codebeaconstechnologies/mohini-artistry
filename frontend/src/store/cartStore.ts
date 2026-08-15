import { create } from "zustand";
import type { Cart, CartTotals } from "@mohini-artistry/shared";
import { cartApi } from "../api/cart";
import { couponsApi } from "../api/coupons";
import { useAuthStore } from "./authStore";
import { PENDING_CART_STORAGE_KEY } from "../lib/constants";

export interface PendingCartItem {
  productId: number;
  quantity: number;
}

function readPendingCart(): PendingCartItem[] {
  try {
    const raw = localStorage.getItem(PENDING_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingCartItem[]) : [];
  } catch {
    return [];
  }
}

function writePendingCart(items: PendingCartItem[]): void {
  localStorage.setItem(PENDING_CART_STORAGE_KEY, JSON.stringify(items));
}

interface CartState {
  cart: Cart | null;
  totals: CartTotals | null;
  /** Anonymous-cart items kept in localStorage while logged out. */
  pendingItems: PendingCartItem[];
  couponCode: string | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  fetchSummary: (coupon?: string) => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ ok: boolean; reason?: string }>;
  removeCoupon: () => void;
  /** Push localStorage cart items into the server cart after login/register, then clear localStorage. */
  flushPendingCart: () => Promise<void>;
  /** Clear in-memory server cart state on logout (localStorage pending cart starts fresh). */
  resetLocal: () => void;
}

function isAuthed(): boolean {
  return useAuthStore.getState().isAuthenticated;
}

export const useCartStore = create<CartState>((set, get) => {
  async function refreshSummary(coupon?: string): Promise<void> {
    if (!isAuthed()) {
      set({ totals: null });
      return;
    }
    try {
      const code = coupon ?? get().couponCode ?? undefined;
      const totals = await cartApi.summary(code);
      set({ totals });
    } catch {
      // Non-fatal — the item list still renders without a totals breakdown.
    }
  }

  // Cart mutation endpoints only return a small { ok, quantity? } ack, so
  // every mutation re-reads GET /cart (+ summary) to get a consistent view.
  async function syncCart(): Promise<void> {
    try {
      const cart = await cartApi.get();
      set({ cart });
      await refreshSummary();
    } catch {
      // Non-fatal — UI keeps showing the last known cart state.
    }
  }

  return {
    cart: null,
    totals: null,
    pendingItems: readPendingCart(),
    couponCode: null,
    isLoading: false,

    fetchCart: async () => {
      if (!isAuthed()) return;
      set({ isLoading: true });
      try {
        const cart = await cartApi.get();
        set({ cart, isLoading: false });
        await refreshSummary();
      } catch {
        set({ isLoading: false });
      }
    },

    fetchSummary: async (coupon) => {
      await refreshSummary(coupon);
    },

    addItem: async (productId, quantity = 1) => {
      if (!isAuthed()) {
        const items = [...get().pendingItems];
        const existing = items.find((i) => i.productId === productId);
        if (existing) existing.quantity += quantity;
        else items.push({ productId, quantity });
        writePendingCart(items);
        set({ pendingItems: items });
        return;
      }
      await cartApi.addItem(productId, quantity);
      await syncCart();
    },

    updateItem: async (productId, quantity) => {
      if (quantity <= 0) {
        await get().removeItem(productId);
        return;
      }
      if (!isAuthed()) {
        const items = [...get().pendingItems];
        const existing = items.find((i) => i.productId === productId);
        if (existing) existing.quantity = quantity;
        writePendingCart(items);
        set({ pendingItems: items });
        return;
      }
      await cartApi.updateItem(productId, quantity);
      await syncCart();
    },

    removeItem: async (productId) => {
      if (!isAuthed()) {
        const items = get().pendingItems.filter((i) => i.productId !== productId);
        writePendingCart(items);
        set({ pendingItems: items });
        return;
      }
      await cartApi.removeItem(productId);
      await syncCart();
    },

    clearCart: async () => {
      if (!isAuthed()) {
        writePendingCart([]);
        set({ pendingItems: [] });
        return;
      }
      await cartApi.clear();
      set((state) => ({ cart: state.cart ? { ...state.cart, items: [] } : null, totals: null, couponCode: null }));
    },

    applyCoupon: async (code) => {
      const res = await couponsApi.validate(code);
      if (res.ok) {
        set({ couponCode: code, totals: res.preview ?? get().totals });
        if (!res.preview) await refreshSummary(code);
      }
      return { ok: res.ok, reason: res.reason };
    },

    removeCoupon: () => {
      set({ couponCode: null });
      void refreshSummary(undefined);
    },

    flushPendingCart: async () => {
      const items = readPendingCart();
      if (items.length === 0) {
        await get().fetchCart();
        return;
      }
      for (const item of items) {
        try {
          await cartApi.addItem(item.productId, item.quantity);
        } catch {
          // Best-effort: keep flushing the rest even if one item fails
          // (e.g. it went out of stock while the user was logged out).
        }
      }
      writePendingCart([]);
      set({ pendingItems: [] });
      await get().fetchCart();
    },

    resetLocal: () => {
      set({ cart: null, totals: null, couponCode: null });
    },
  };
});

/** Total item count across whichever cart is currently active (server or pending-local). */
export function selectCartItemCount(state: CartState): number {
  if (state.cart) return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return state.pendingItems.reduce((sum, item) => sum + item.quantity, 0);
}
