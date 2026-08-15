export const ORDER_STATUSES = [
  "placed",
  "prepared",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "verified", "failed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Draft = a persisted cart with no order row yet; not a real `orders.status` value. */
export const DRAFT_ORDER_LABEL = "DraftOrder";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order Placed",
  prepared: "Order Prepared",
  shipped: "Order Shipped",
  delivered: "Order Delivered",
  cancelled: "Cancelled",
};

/** Forward-only transitions an admin may apply from a given status. */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["prepared", "cancelled"],
  prepared: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

/**
 * The customer-facing label. An order row is created (with payment_status
 * 'pending') the moment Razorpay checkout opens, before payment succeeds —
 * until payment is verified it should read as "DraftOrder" (unpaid), not
 * "Order Placed", regardless of the raw `status` column's default value.
 */
export function getOrderDisplayStatus(status: OrderStatus, paymentStatus: PaymentStatus): string {
  if (paymentStatus === "pending") return DRAFT_ORDER_LABEL;
  if (paymentStatus === "failed") return "Payment Failed — Please Retry";
  return ORDER_STATUS_LABELS[status];
}
