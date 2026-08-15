import type { Order } from "@mohini-artistry/shared";
import { apiClient } from "./client";

export const ordersApi = {
  list: () => apiClient.get<Order[]>("/orders"),
  get: (orderNumber: string) => apiClient.get<Order>(`/orders/${encodeURIComponent(orderNumber)}`),
  track: (orderNumber: string, email: string) =>
    apiClient.get<Order>(`/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`),
};
