import type { Review, Paginated, CreateReviewInput } from "@mohini-artistry/shared";
import { apiClient } from "./client";

export const reviewsApi = {
  list: (productId: number, page = 1, limit = 10) =>
    apiClient.get<Paginated<Review>>(`/products/${productId}/reviews?page=${page}&limit=${limit}`),
  create: (productId: number, input: CreateReviewInput) => apiClient.post<Review>(`/products/${productId}/reviews`, input),
};
