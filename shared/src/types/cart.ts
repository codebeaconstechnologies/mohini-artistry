import type { Product } from "./product";

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  items: CartItem[];
}

export type FreeShippingReason = "threshold" | "first_order" | "coupon" | null;

export interface CartTotals {
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
  freeShippingReason: FreeShippingReason;
  couponCode?: string | null;
  couponError?: string | null;
}
