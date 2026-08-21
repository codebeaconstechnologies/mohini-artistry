export const RETURN_ELIGIBILITY_WINDOW_DAYS = 5;

export const REFUND_REQUEST_STATUSES = ["requested", "refunded", "rejected", "refund_failed"] as const;
export type RefundRequestStatus = (typeof REFUND_REQUEST_STATUSES)[number];

export const REPLACEMENT_REQUEST_STATUSES = [
  "requested",
  "approved",
  "customer_shipped",
  "received",
  "replacement_shipped",
  "rejected",
] as const;
export type ReplacementRequestStatus = (typeof REPLACEMENT_REQUEST_STATUSES)[number];

export type ReturnRequestStatus = RefundRequestStatus | ReplacementRequestStatus;

export const RETURN_REQUEST_TYPES = ["refund", "replacement"] as const;
export type ReturnRequestType = (typeof RETURN_REQUEST_TYPES)[number];

/** Terminal statuses — no further transitions possible, and a new request may be opened on the item. */
export const RETURN_REQUEST_TERMINAL_STATUSES: ReturnRequestStatus[] = [
  "refunded",
  "rejected",
  "refund_failed",
  "replacement_shipped",
];

export const REFUND_STATUS_LABELS: Record<RefundRequestStatus, string> = {
  requested: "Refund Requested",
  refunded: "Refunded",
  rejected: "Refund Rejected",
  refund_failed: "Refund Failed",
};

export const REPLACEMENT_STATUS_LABELS: Record<ReplacementRequestStatus, string> = {
  requested: "Replacement Requested",
  approved: "Replacement Approved — Please Ship the Item Back",
  customer_shipped: "Item Shipped — Awaiting Receipt",
  received: "Item Received — Preparing Replacement",
  replacement_shipped: "Replacement Shipped",
  rejected: "Replacement Rejected",
};

export function getReturnStatusLabel(type: ReturnRequestType, status: ReturnRequestStatus): string {
  if (type === "refund") return REFUND_STATUS_LABELS[status as RefundRequestStatus];
  return REPLACEMENT_STATUS_LABELS[status as ReplacementRequestStatus];
}
