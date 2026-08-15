import type { Product, ProductListQuery, Paginated, Category } from "@mohini-artistry/shared";
import { apiClient } from "./client";

function buildProductQuery(query: ProductListQuery): string {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  if (query.bestseller) params.set("bestseller", "true");
  if (query.mostLoved) params.set("mostLoved", "true");
  if (query.topRated) params.set("topRated", "true");
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const productsApi = {
  list: (query: ProductListQuery = {}) => apiClient.get<Paginated<Product>>(`/products${buildProductQuery(query)}`),
  newArrivals: () => apiClient.get<Product[]>("/products/new-arrivals"),
  mostLoved: () => apiClient.get<Product[]>("/products/most-loved"),
  getBySlug: (slug: string) => apiClient.get<Product>(`/products/${encodeURIComponent(slug)}`),
  similar: (slug: string) => apiClient.get<Product[]>(`/products/${encodeURIComponent(slug)}/similar`),
};

export const categoriesApi = {
  list: () => apiClient.get<Category[]>("/categories"),
};
