import type { Env } from "../env";
import type { ReturnRequest, ReturnRequestType } from "@mohini-artistry/shared";
import { RETURN_ELIGIBILITY_WINDOW_DAYS, RETURN_REQUEST_TERMINAL_STATUSES } from "@mohini-artistry/shared";
import { nowMs } from "./db";
import { HttpError } from "../middleware/errorHandler";

const WINDOW_MS = RETURN_ELIGIBILITY_WINDOW_DAYS * 24 * 60 * 60 * 1000;

interface ReturnRequestRow {
  id: number;
  order_id: number;
  order_item_id: number;
  user_id: number;
  type: string;
  status: string;
  reason: string;
  admin_note: string | null;
  return_courier: string | null;
  return_tracking_number: string | null;
  replacement_courier: string | null;
  replacement_tracking_number: string | null;
  refund_amount_paise: number | null;
  created_at: number;
  updated_at: number;
}

function rowToReturnRequest(row: ReturnRequestRow): ReturnRequest {
  return {
    id: row.id,
    orderId: row.order_id,
    orderItemId: row.order_item_id,
    userId: row.user_id,
    type: row.type as ReturnRequestType,
    status: row.status as ReturnRequest["status"],
    reason: row.reason,
    adminNote: row.admin_note,
    returnCourier: row.return_courier,
    returnTrackingNumber: row.return_tracking_number,
    replacementCourier: row.replacement_courier,
    replacementTrackingNumber: row.replacement_tracking_number,
    refundAmountPaise: row.refund_amount_paise,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getReturnRequestById(env: Env, id: number): Promise<ReturnRequest | null> {
  const row = await env.DB.prepare(
    `SELECT id, order_id, order_item_id, user_id, type, status, reason, admin_note,
            return_courier, return_tracking_number, replacement_courier, replacement_tracking_number,
            refund_amount_paise, created_at, updated_at
     FROM return_requests WHERE id = ?`
  )
    .bind(id)
    .first<ReturnRequestRow>();
  return row ? rowToReturnRequest(row) : null;
}

export interface AdminReturnListItem extends ReturnRequest {
  orderNumber: string;
  productName: string;
  contactEmail: string;
}

export async function listReturnRequestsAdmin(
  env: Env,
  opts: { status?: string; type?: string }
): Promise<AdminReturnListItem[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (opts.status) {
    conditions.push("rr.status = ?");
    params.push(opts.status);
  }
  if (opts.type) {
    conditions.push("rr.type = ?");
    params.push(opts.type);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await env.DB.prepare(
    `SELECT rr.id, rr.order_id, rr.order_item_id, rr.user_id, rr.type, rr.status, rr.reason, rr.admin_note,
            rr.return_courier, rr.return_tracking_number, rr.replacement_courier, rr.replacement_tracking_number,
            rr.refund_amount_paise, rr.created_at, rr.updated_at,
            o.order_number AS order_number, o.contact_email AS contact_email,
            oi.product_name AS product_name
     FROM return_requests rr
     JOIN orders o ON o.id = rr.order_id
     JOIN order_items oi ON oi.id = rr.order_item_id
     ${whereClause}
     ORDER BY rr.created_at DESC
     LIMIT 200`
  )
    .bind(...params)
    .all<ReturnRequestRow & { order_number: string; contact_email: string; product_name: string }>();

  return (result.results ?? []).map((row) => ({
    ...rowToReturnRequest(row),
    orderNumber: row.order_number,
    productName: row.product_name,
    contactEmail: row.contact_email,
  }));
}

interface EligibleItemRow {
  item_id: number;
  is_refund_allowed: number;
  is_replace_allowed: number;
  line_total_paise: number;
  order_id: number;
  user_id: number;
  status: string;
  payment_status: string;
  delivered_at: number | null;
}

/** Creates a refund/replacement request after re-validating eligibility server-side. */
export async function createReturnRequest(
  env: Env,
  userId: number,
  input: { orderItemId: number; type: ReturnRequestType; reason: string }
): Promise<ReturnRequest> {
  const row = await env.DB.prepare(
    `SELECT oi.id AS item_id, oi.is_refund_allowed, oi.is_replace_allowed, oi.line_total_paise,
            o.id AS order_id, o.user_id, o.status, o.payment_status, o.delivered_at
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.id = ?`
  )
    .bind(input.orderItemId)
    .first<EligibleItemRow>();

  if (!row || row.user_id !== userId) {
    throw new HttpError(404, "Order item not found.", "ITEM_NOT_FOUND");
  }
  if (row.payment_status !== "verified" || row.status !== "delivered" || !row.delivered_at) {
    throw new HttpError(409, "This item is not eligible for a refund or replacement.", "NOT_ELIGIBLE");
  }
  if (nowMs() - row.delivered_at > WINDOW_MS) {
    throw new HttpError(
      409,
      `Refund/replacement requests must be made within ${RETURN_ELIGIBILITY_WINDOW_DAYS} days of delivery.`,
      "WINDOW_EXPIRED"
    );
  }
  const flagAllowed = input.type === "refund" ? row.is_refund_allowed === 1 : row.is_replace_allowed === 1;
  if (!flagAllowed) {
    throw new HttpError(409, "This item is not eligible for that request type.", "NOT_ELIGIBLE");
  }

  const openPlaceholders = RETURN_REQUEST_TERMINAL_STATUSES.map(() => "?").join(",");
  const existing = await env.DB.prepare(
    `SELECT id FROM return_requests WHERE order_item_id = ? AND status NOT IN (${openPlaceholders})`
  )
    .bind(input.orderItemId, ...RETURN_REQUEST_TERMINAL_STATUSES)
    .first<{ id: number }>();
  if (existing) {
    throw new HttpError(409, "There is already an open request for this item.", "REQUEST_EXISTS");
  }

  const now = nowMs();
  const insertResult = await env.DB.prepare(
    `INSERT INTO return_requests (order_id, order_item_id, user_id, type, status, reason, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'requested', ?, ?, ?)`
  )
    .bind(row.order_id, input.orderItemId, userId, input.type, input.reason, now, now)
    .run();

  const id = insertResult.meta.last_row_id as number;
  await env.DB.prepare(
    `INSERT INTO return_request_history (return_request_id, status, note, created_at) VALUES (?, 'requested', ?, ?)`
  )
    .bind(id, input.reason, now)
    .run();

  const created = await getReturnRequestById(env, id);
  if (!created) throw new HttpError(500, "Could not create the request.", "INTERNAL_ERROR");
  return created;
}

export interface ReturnRequestForDecision {
  request: ReturnRequest;
  razorpayPaymentId: string | null;
  lineTotalPaise: number;
}

/** Joins in the payment id + line amount an admin decision needs (refund amount, Razorpay payment to refund against). */
export async function getReturnRequestForDecision(env: Env, id: number): Promise<ReturnRequestForDecision | null> {
  const row = await env.DB.prepare(
    `SELECT rr.id, rr.order_id, rr.order_item_id, rr.user_id, rr.type, rr.status, rr.reason, rr.admin_note,
            rr.return_courier, rr.return_tracking_number, rr.replacement_courier, rr.replacement_tracking_number,
            rr.refund_amount_paise, rr.created_at, rr.updated_at,
            o.razorpay_payment_id AS razorpay_payment_id,
            oi.line_total_paise AS line_total_paise
     FROM return_requests rr
     JOIN orders o ON o.id = rr.order_id
     JOIN order_items oi ON oi.id = rr.order_item_id
     WHERE rr.id = ?`
  )
    .bind(id)
    .first<ReturnRequestRow & { razorpay_payment_id: string | null; line_total_paise: number }>();
  if (!row) return null;
  return {
    request: rowToReturnRequest(row),
    razorpayPaymentId: row.razorpay_payment_id,
    lineTotalPaise: row.line_total_paise,
  };
}

async function applyTransition(
  env: Env,
  id: number,
  status: string,
  fields: Record<string, unknown>,
  note?: string
): Promise<void> {
  const now = nowMs();
  const setCols = ["status = ?", "updated_at = ?", ...Object.keys(fields).map((k) => `${k} = ?`)];
  await env.DB.prepare(`UPDATE return_requests SET ${setCols.join(", ")} WHERE id = ?`)
    .bind(status, now, ...Object.values(fields), id)
    .run();
  await env.DB.prepare(
    `INSERT INTO return_request_history (return_request_id, status, note, created_at) VALUES (?, ?, ?, ?)`
  )
    .bind(id, status, note ?? null, now)
    .run();
}

export async function markReturnRequestRejected(env: Env, id: number, note?: string): Promise<void> {
  await applyTransition(env, id, "rejected", {}, note);
}

export async function markRefundSucceeded(
  env: Env,
  id: number,
  razorpayRefundId: string,
  amountPaise: number
): Promise<void> {
  await applyTransition(env, id, "refunded", {
    razorpay_refund_id: razorpayRefundId,
    refund_amount_paise: amountPaise,
  });
}

export async function markRefundFailed(env: Env, id: number, note?: string): Promise<void> {
  await applyTransition(env, id, "refund_failed", {}, note);
}

export async function markReplacementApproved(env: Env, id: number, note?: string): Promise<void> {
  await applyTransition(env, id, "approved", {}, note);
}

export async function markReplacementCustomerShipped(
  env: Env,
  id: number,
  courier: string,
  trackingNumber: string
): Promise<void> {
  await applyTransition(env, id, "customer_shipped", {
    return_courier: courier,
    return_tracking_number: trackingNumber,
  });
}

export async function markReplacementReceived(env: Env, id: number, note?: string): Promise<void> {
  await applyTransition(env, id, "received", {}, note);
}

export async function markReplacementShipped(
  env: Env,
  id: number,
  courier: string,
  trackingNumber: string
): Promise<void> {
  await applyTransition(env, id, "replacement_shipped", {
    replacement_courier: courier,
    replacement_tracking_number: trackingNumber,
  });
}
