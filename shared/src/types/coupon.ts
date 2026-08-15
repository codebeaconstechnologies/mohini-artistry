export type CouponType = "percent" | "flat" | "free_shipping";

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  minOrderPaise: number;
  maxDiscountPaise: number | null;
  isActive: boolean;
  startsAt: number | null;
  expiresAt: number | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  createdAt: number;
}
