import type { Env } from "../env";
import type { PricingCoupon } from "./pricing";
import { nowMs } from "./db";

interface CouponRow {
  id: number;
  code: string;
  type: "percent" | "flat" | "free_shipping";
  value: number;
  min_order_paise: number;
  max_discount_paise: number | null;
  is_active: number;
  starts_at: number | null;
  expires_at: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
}

export interface CouponValidationResult {
  ok: boolean;
  reason?: string;
  coupon?: PricingCoupon;
  couponId?: number;
}

/**
 * Validates a coupon code against active/date-window/min-order/usage limits.
 * Server-authoritative: called at both preview time and final checkout time.
 */
export async function validateCoupon(
  env: Env,
  code: string,
  userId: number,
  subtotalPaise: number
): Promise<CouponValidationResult> {
  const row = await env.DB.prepare(
    `SELECT id, code, type, value, min_order_paise, max_discount_paise, is_active,
            starts_at, expires_at, usage_limit, usage_count, per_user_limit
     FROM coupons WHERE code = ?`
  )
    .bind(code.toUpperCase())
    .first<CouponRow>();

  if (!row) return { ok: false, reason: "This coupon code is not valid." };
  if (row.is_active !== 1) return { ok: false, reason: "This coupon is no longer active." };

  const now = nowMs();
  if (row.starts_at && now < row.starts_at) {
    return { ok: false, reason: "This coupon is not active yet." };
  }
  if (row.expires_at && now > row.expires_at) {
    return { ok: false, reason: "This coupon has expired." };
  }
  if (row.min_order_paise > 0 && subtotalPaise < row.min_order_paise) {
    return {
      ok: false,
      reason: `Add items worth ₹${(row.min_order_paise / 100).toFixed(0)} or more to use this coupon.`,
    };
  }
  if (row.usage_limit !== null && row.usage_count >= row.usage_limit) {
    return { ok: false, reason: "This coupon has reached its usage limit." };
  }

  const userRedemptions = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM coupon_redemptions WHERE coupon_id = ? AND user_id = ?`
  )
    .bind(row.id, userId)
    .first<{ count: number }>();

  if (userRedemptions && userRedemptions.count >= row.per_user_limit) {
    return { ok: false, reason: "You have already used this coupon." };
  }

  return {
    ok: true,
    couponId: row.id,
    coupon: {
      code: row.code,
      type: row.type,
      value: row.value,
      maxDiscountPaise: row.max_discount_paise,
    },
  };
}

export async function isFirstOrder(env: Env, userId: number): Promise<boolean> {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM orders WHERE user_id = ? AND payment_status = 'verified'`
  )
    .bind(userId)
    .first<{ count: number }>();
  return !row || row.count === 0;
}
