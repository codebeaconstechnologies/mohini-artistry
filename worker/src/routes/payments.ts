import { Hono } from "hono";
import { verifyPaymentSchema } from "@mohini-artistry/shared";
import type { Env, Variables } from "../env";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { verifyPaymentSignature, verifyWebhookSignature } from "../lib/razorpay";
import { markOrderVerifiedAndFulfill, markOrderPaymentFailed } from "../lib/orderFulfillment";

const payments = new Hono<{ Bindings: Env; Variables: Variables }>();

payments.post("/verify", requireAuth, async (c) => {
  const user = c.get("user");
  const body = verifyPaymentSchema.parse(await c.req.json());

  const order = await c.env.DB.prepare(
    "SELECT id, user_id, order_number FROM orders WHERE razorpay_order_id = ?"
  )
    .bind(body.razorpayOrderId)
    .first<{ id: number; user_id: number; order_number: string }>();

  if (!order || order.user_id !== user.id) {
    throw new HttpError(404, "Order not found.", "ORDER_NOT_FOUND");
  }

  const signatureValid = await verifyPaymentSignature(
    c.env.RAZORPAY_KEY_SECRET,
    body.razorpayOrderId,
    body.razorpayPaymentId,
    body.razorpaySignature
  );

  if (!signatureValid) {
    throw new HttpError(400, "Payment verification failed. If money was deducted, it will be refunded automatically.", "SIGNATURE_INVALID");
  }

  const result = await markOrderVerifiedAndFulfill(
    c.env,
    body.razorpayOrderId,
    body.razorpayPaymentId,
    body.razorpaySignature
  );

  if (!result) {
    throw new HttpError(404, "Order not found.", "ORDER_NOT_FOUND");
  }

  return c.json({ verified: true, orderNumber: order.order_number, orderId: result.orderId });
});

// Razorpay webhook — the authoritative confirmation path. Not behind requireAuth:
// Razorpay itself is the caller, authenticated via the signed raw body instead of a JWT.
payments.post("/webhook", async (c) => {
  const signatureHeader = c.req.header("X-Razorpay-Signature");
  if (!signatureHeader) {
    throw new HttpError(400, "Missing webhook signature.", "MISSING_SIGNATURE");
  }

  const rawBody = await c.req.text();
  const valid = await verifyWebhookSignature(c.env.RAZORPAY_WEBHOOK_SECRET, rawBody, signatureHeader);
  if (!valid) {
    throw new HttpError(400, "Invalid webhook signature.", "INVALID_SIGNATURE");
  }

  const payload = JSON.parse(rawBody) as {
    event: string;
    payload?: { payment?: { entity?: { id: string; order_id: string; status: string } } };
  };

  const paymentEntity = payload.payload?.payment?.entity;

  if (payload.event === "payment.captured" && paymentEntity) {
    await markOrderVerifiedAndFulfill(c.env, paymentEntity.order_id, paymentEntity.id, null);
  } else if (payload.event === "payment.failed" && paymentEntity) {
    await markOrderPaymentFailed(c.env, paymentEntity.order_id);
  }

  return c.json({ received: true });
});

export default payments;
