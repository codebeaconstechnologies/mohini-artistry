import type { Product } from "@mohini-artistry/shared";
import { apiClient } from "./client";

export const wishlistApi = {
  list: () => apiClient.get<Product[]>("/wishlist"),
  add: (productId: number) => apiClient.post<void>(`/wishlist/${productId}`),
  remove: (productId: number) => apiClient.delete<void>(`/wishlist/${productId}`),
};
