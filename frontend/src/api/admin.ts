import type {
  Product,
  ProductImage,
  Order,
  Coupon,
  User,
  Paginated,
  AdminProductInput,
  AdminProductUpdateInput,
  AdminOrderStatusInput,
  AdminCouponInput,
  AdminCouponUpdateInput,
  AdminSetItemFlagsInput,
  AdminReturnDecisionInput,
  ShipTrackingInput,
  ReturnRequest,
} from "@mohini-artistry/shared";
import { apiClient } from "./client";
import { ADMIN_IMAGE_UPLOAD_FIELD_NAME } from "../lib/constants";

export interface AdminProductListQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrderListQuery {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminUserListQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminReturnListQuery {
  status?: string;
  type?: string;
}

export interface AdminReturnListItem extends ReturnRequest {
  orderNumber: string;
  productName: string;
  contactEmail: string;
}

function toQueryString(params: object): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params) as [string, string | number | undefined][]) {
    if (value !== undefined && value !== "") usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export interface ReorderImageItem {
  imageId: number;
  sortOrder: number;
  isPrimary: boolean;
}

export const adminApi = {
  products: {
    list: (query: AdminProductListQuery = {}) =>
      apiClient.get<Paginated<Product>>(`/admin/products${toQueryString(query)}`),
    create: (input: AdminProductInput) => apiClient.post<Product>("/admin/products", input),
    update: (id: number, input: AdminProductUpdateInput) => apiClient.put<Product>(`/admin/products/${id}`, input),
    remove: (id: number) => apiClient.delete<{ ok: boolean }>(`/admin/products/${id}`),
    uploadImage: (id: number, file: File) => {
      const formData = new FormData();
      // The worker's admin image-upload route expects this exact field name.
      formData.append(ADMIN_IMAGE_UPLOAD_FIELD_NAME, file);
      return apiClient.postForm<ProductImage>(`/admin/products/${id}/images`, formData);
    },
    deleteImage: (id: number, imageId: number) => apiClient.delete<{ ok: boolean }>(`/admin/products/${id}/images/${imageId}`),
    reorderImages: (id: number, items: ReorderImageItem[]) =>
      apiClient.put<ProductImage[]>(`/admin/products/${id}/images/reorder`, items),
  },
  orders: {
    list: (query: AdminOrderListQuery = {}) => apiClient.get<Paginated<Order>>(`/admin/orders${toQueryString(query)}`),
    get: (id: number | string) => apiClient.get<Order>(`/admin/orders/${id}`),
    updateStatus: (id: number | string, input: AdminOrderStatusInput) =>
      apiClient.patch<Order>(`/admin/orders/${id}/status`, input),
    setItemFlags: (orderId: number | string, itemId: number | string, input: AdminSetItemFlagsInput) =>
      apiClient.patch<Order>(`/admin/orders/${orderId}/items/${itemId}/flags`, input),
  },
  returns: {
    list: (query: AdminReturnListQuery = {}) =>
      apiClient.get<{ items: AdminReturnListItem[] }>(`/admin/returns${toQueryString(query)}`),
    get: (id: number | string) => apiClient.get<ReturnRequest>(`/admin/returns/${id}`),
    decide: (id: number | string, input: AdminReturnDecisionInput) =>
      apiClient.post<ReturnRequest>(`/admin/returns/${id}/decision`, input),
    receive: (id: number | string) => apiClient.post<ReturnRequest>(`/admin/returns/${id}/receive`),
    shipReplacement: (id: number | string, input: ShipTrackingInput) =>
      apiClient.post<ReturnRequest>(`/admin/returns/${id}/ship-replacement`, input),
  },
  coupons: {
    list: () => apiClient.get<Coupon[]>("/admin/coupons"),
    create: (input: AdminCouponInput) => apiClient.post<Coupon>("/admin/coupons", input),
    update: (id: number, input: AdminCouponUpdateInput) => apiClient.put<Coupon>(`/admin/coupons/${id}`, input),
    remove: (id: number) => apiClient.delete<{ ok: boolean }>(`/admin/coupons/${id}`),
  },
  users: {
    list: (query: AdminUserListQuery = {}) => apiClient.get<Paginated<User>>(`/admin/users${toQueryString(query)}`),
    update: (id: number, input: { isAdmin: boolean }) => apiClient.patch<User>(`/admin/users/${id}`, input),
  },
};
