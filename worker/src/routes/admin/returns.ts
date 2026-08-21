import { Hono } from "hono";
import { adminReturnDecisionSchema, shipTrackingSchema } from "@mohini-artistry/shared";
import type { Env, Variables } from "../../env";
import { requireAuth, requireAdmin } from "../../middleware/auth";
import { HttpError } from "../../middleware/errorHandler";
import { createRefund } from "../../lib/razorpay";
import {
  listReturnRequestsAdmin,
  getReturnRequestById,
  getReturnRequestForDecision,
  markReturnRequestRejected,
  markRefundSucceeded,
  markRefundFailed,
  markReplacementApproved,
  markReplacementReceived,
  markReplacementShipped,
} from "../../lib/returns";

const adminReturns = new Hono<{ Bindings: Env; Variables: Variables }>();
adminReturns.use("*", requireAuth, requireAdmin);

adminReturns.get("/", async (c) => {
  const status = c.req.query("status");
  const type = c.req.query("type");
  const items = await listReturnRequestsAdmin(c.env, { status, type });
  return c.json({ items });
});

adminReturns.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid request id.", "VALIDATION_ERROR");
  const request = await getReturnRequestById(c.env, id);
  if (!request) throw new HttpError(404, "Request not found.", "NOT_FOUND");
  return c.json(request);
});

adminReturns.post("/:id/decision", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid request id.", "VALIDATION_ERROR");
  const body = adminReturnDecisionSchema.parse(await c.req.json());

  const detail = await getReturnRequestForDecision(c.env, id);
  if (!detail) throw new HttpError(404, "Request not found.", "NOT_FOUND");
  const { request } = detail;

  if (request.status !== "requested") {
    throw new HttpError(409, "This request has already been decided.", "INVALID_STATE");
  }

  if (body.action === "reject") {
    await markReturnRequestRejected(c.env, id, body.note);
    const updated = await getReturnRequestById(c.env, id);
    return c.json(updated);
  }

  // action === "approve"
  if (request.type === "replacement") {
    await markReplacementApproved(c.env, id, body.note);
    const updated = await getReturnRequestById(c.env, id);
    return c.json(updated);
  }

  // Refund: call Razorpay synchronously.
  if (!detail.razorpayPaymentId) {
    throw new HttpError(409, "This order has no payment to refund.", "NO_PAYMENT");
  }
  try {
    const refund = await createRefund(
      c.env.RAZORPAY_KEY_ID,
      c.env.RAZORPAY_KEY_SECRET,
      detail.razorpayPaymentId,
      detail.lineTotalPaise,
      { returnRequestId: String(id) }
    );
    await markRefundSucceeded(c.env, id, refund.id, detail.lineTotalPaise);
  } catch (err) {
    await markRefundFailed(c.env, id, err instanceof Error ? err.message : "Refund failed.");
  }
  const updated = await getReturnRequestById(c.env, id);
  return c.json(updated);
});

adminReturns.post("/:id/receive", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid request id.", "VALIDATION_ERROR");
  const request = await getReturnRequestById(c.env, id);
  if (!request) throw new HttpError(404, "Request not found.", "NOT_FOUND");
  if (request.type !== "replacement" || request.status !== "customer_shipped") {
    throw new HttpError(409, "This request is not awaiting receipt.", "INVALID_STATE");
  }
  await markReplacementReceived(c.env, id);
  const updated = await getReturnRequestById(c.env, id);
  return c.json(updated);
});

adminReturns.post("/:id/ship-replacement", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid request id.", "VALIDATION_ERROR");
  const body = shipTrackingSchema.parse(await c.req.json());
  const request = await getReturnRequestById(c.env, id);
  if (!request) throw new HttpError(404, "Request not found.", "NOT_FOUND");
  if (request.type !== "replacement" || request.status !== "received") {
    throw new HttpError(409, "This request is not awaiting a replacement shipment.", "INVALID_STATE");
  }
  await markReplacementShipped(c.env, id, body.courier, body.trackingNumber);
  const updated = await getReturnRequestById(c.env, id);
  return c.json(updated);
});

export default adminReturns;
