import {
  FREE_SHIPPING_THRESHOLD_PAISE,
  FIRST_ORDER_FREE_SHIPPING_THRESHOLD_PAISE,
  STANDARD_SHIPPING_FEE_PAISE,
  type CartTotals,
  type CouponType,
} from "@mohini-artistry/shared";

export interface PricingLineItem {
  unitPricePaise: number;
  quantity: number;
}

export interface PricingCoupon {
  code: string;
  type: CouponType;
  value: number;
  maxDiscountPaise: number | null;
}

export interface PricingInput {
  items: PricingLineItem[];
  isFirstOrder: boolean;
  coupon?: PricingCoupon | null;
}

/**
 * Single source of truth for cart/order money math. Callers MUST source
 * `unitPricePaise` fresh from the `products` table — never from client input
 * or cached cart data — so totals can never be spoofed by the client.
 */
export function computeCartTotals(input: PricingInput): CartTotals {
  const subtotalPaise = input.items.reduce(
    (sum, item) => sum + item.unitPricePaise * item.quantity,
    0
  );

  let shippingPaise = STANDARD_SHIPPING_FEE_PAISE;
  let freeShippingReason: CartTotals["freeShippingReason"] = null;

  if (subtotalPaise > FREE_SHIPPING_THRESHOLD_PAISE) {
    shippingPaise = 0;
    freeShippingReason = "threshold";
  } else if (
    input.isFirstOrder &&
    subtotalPaise > FIRST_ORDER_FREE_SHIPPING_THRESHOLD_PAISE
  ) {
    shippingPaise = 0;
    freeShippingReason = "first_order";
  }

  let discountPaise = 0;
  if (input.coupon) {
    if (input.coupon.type === "free_shipping") {
      shippingPaise = 0;
      freeShippingReason = "coupon";
    } else if (input.coupon.type === "flat") {
      discountPaise = Math.min(input.coupon.value, subtotalPaise);
    } else if (input.coupon.type === "percent") {
      const raw = Math.floor((subtotalPaise * input.coupon.value) / 100);
      discountPaise = input.coupon.maxDiscountPaise
        ? Math.min(raw, input.coupon.maxDiscountPaise)
        : raw;
    }
  }

  const totalPaise = Math.max(0, subtotalPaise + shippingPaise - discountPaise);

  return {
    subtotalPaise,
    shippingPaise,
    discountPaise,
    totalPaise,
    freeShippingReason,
    couponCode: input.coupon?.code ?? null,
  };
}
