import type { CartTotals } from "@mohini-artistry/shared";
import { apiClient } from "./client";

export interface ValidateCouponResponse {
  ok: boolean;
  reason?: string;
  preview?: CartTotals;
}

export const couponsApi = {
  validate: (code: string) => apiClient.post<ValidateCouponResponse>("/coupons/validate", { code }),
};
