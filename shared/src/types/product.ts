export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  categoryId: number;
  categorySlug?: string;
  categoryName?: string;
  description: string;
  pricePaise: number;
  compareAtPaise: number | null;
  stock: number;
  isNewArrival: boolean;
  isBestseller: boolean;
  isActive: boolean;
  ratingAvg: number;
  ratingCount: number;
  orderCount: number;
  createdAt: number;
  updatedAt: number;
  images: ProductImage[];
}

export type ProductSortOption =
  | "featured"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "rating";

export interface ProductListQuery {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  bestseller?: boolean;
  mostLoved?: boolean;
  topRated?: boolean;
  sort?: ProductSortOption;
  page?: number;
  limit?: number;
  search?: string;
}
