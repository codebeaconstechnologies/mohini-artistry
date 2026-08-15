import type { ShippingAddressInput, CartTotals, VerifyPaymentInput } from "@mohini-artistry/shared";
import { apiClient } from "./client";

export interface CreateOrderInputPayload {
  shippingAddress: ShippingAddressInput;
  couponCode?: string;
}

export interface CreateOrderResponse {
  orderNumber: string;
  orderId: number;
  razorpayOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  prefill: { name: string; email: string; contact: string };
  totals: CartTotals;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  orderNumber: string;
  orderId: number;
}

export const checkoutApi = {
  createOrder: (input: CreateOrderInputPayload) => apiClient.post<CreateOrderResponse>("/checkout/create-order", input),
  verifyPayment: (input: VerifyPaymentInput) => apiClient.post<VerifyPaymentResponse>("/payments/verify", input),
};
