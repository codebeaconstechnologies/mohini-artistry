import type { Cart, CartTotals } from "@mohini-artistry/shared";
import { apiClient } from "./client";

export interface CartMutationResult {
  ok: boolean;
  quantity?: number;
}

// POST/PATCH/DELETE on /cart/items return a small { ok, quantity? } ack, not
// the full cart — callers (cartStore) refetch GET /cart afterwards to get
// the up-to-date item list and summary in one consistent read.
export const cartApi = {
  get: () => apiClient.get<Cart>("/cart"),
  summary: (coupon?: string) =>
    apiClient.get<CartTotals>(`/cart/summary${coupon ? `?coupon=${encodeURIComponent(coupon)}` : ""}`),
  addItem: (productId: number, quantity: number) =>
    apiClient.post<CartMutationResult>("/cart/items", { productId, quantity }),
  updateItem: (productId: number, quantity: number) =>
    apiClient.patch<CartMutationResult>(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId: number) => apiClient.delete<CartMutationResult>(`/cart/items/${productId}`),
  clear: () => apiClient.delete<CartMutationResult>("/cart"),
};
