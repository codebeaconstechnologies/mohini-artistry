import { Hono } from "hono";
import { createOrderSchema } from "@mohini-artistry/shared";
import type { Env, Variables } from "../env";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { getFreshCartItems } from "../lib/cart";
import { computeCartTotals } from "../lib/pricing";
import { validateCoupon, isFirstOrder } from "../lib/coupons";
import { createRazorpayOrder } from "../lib/razorpay";
import { generateOrderNumber } from "../lib/orderNumber";
import { nowMs } from "../lib/db";

const checkout = new Hono<{ Bindings: Env; Variables: Variables }>();

checkout.post("/create-order", requireAuth, async (c) => {
  const user = c.get("user");
  const body = createOrderSchema.parse(await c.req.json());

  const items = await getFreshCartItems(c.env, user.id);
  if (items.length === 0) {
    throw new HttpError(400, "Your cart is empty.", "EMPTY_CART");
  }

  const unavailable = items.filter((i) => !i.isActive || i.stock < i.quantity);
  if (unavailable.length > 0) {
    throw new HttpError(
      409,
      `Some items in your cart are no longer available in the requested quantity: ${unavailable
        .map((i) => i.name)
        .join(", ")}.`,
      "ITEMS_UNAVAILABLE"
    );
  }

  const rawSubtotalPaise = items.reduce((sum, i) => sum + i.unitPricePaise * i.quantity, 0);

  let couponResult: Awaited<ReturnType<typeof validateCoupon>> | null = null;
  if (body.couponCode) {
    couponResult = await validateCoupon(c.env, body.couponCode, user.id, rawSubtotalPaise);
    if (!couponResult.ok) {
      throw new HttpError(400, couponResult.reason ?? "Invalid coupon.", "INVALID_COUPON");
    }
  }

  const firstOrder = await isFirstOrder(c.env, user.id);

  const totals = computeCartTotals({
    items: items.map((i) => ({ unitPricePaise: i.unitPricePaise, quantity: i.quantity })),
    isFirstOrder: firstOrder,
    coupon: couponResult?.coupon ?? null,
  });

  const orderNumber = generateOrderNumber();

  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder(c.env.RAZORPAY_KEY_ID, c.env.RAZORPAY_KEY_SECRET, {
      amountPaise: totals.totalPaise,
      receipt: orderNumber,
      notes: { userId: String(user.id), orderNumber },
    });
  } catch (err) {
    console.error(err);
    throw new HttpError(502, "Could not start payment. Please try again.", "PAYMENT_GATEWAY_ERROR");
  }

  const now = nowMs();
  const addr = body.shippingAddress;

  const insertResult = await c.env.DB.prepare(
    `INSERT INTO orders (
       order_number, user_id, status, subtotal_paise, shipping_paise, discount_paise, total_paise,
       coupon_code, shipping_name, shipping_phone, shipping_address1, shipping_address2,
       shipping_state, shipping_city, shipping_pincode, contact_email,
       razorpay_order_id, payment_status, created_at, updated_at
     ) VALUES (?, ?, 'placed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
  )
    .bind(
      orderNumber,
      user.id,
      totals.subtotalPaise,
      totals.shippingPaise,
      totals.discountPaise,
      totals.totalPaise,
      couponResult?.coupon?.code ?? null,
      addr.fullName,
      addr.phone,
      addr.address1,
      addr.address2 ?? null,
      addr.state,
      addr.city,
      addr.pincode,
      user.email,
      razorpayOrder.id,
      now,
      now
    )
    .run();

  const orderId = insertResult.meta.last_row_id as number;

  const itemInserts = items.map((item) =>
    c.env.DB.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price_paise, quantity, line_total_paise)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(orderId, item.productId, item.name, item.unitPricePaise, item.quantity, item.unitPricePaise * item.quantity)
  );
  await c.env.DB.batch(itemInserts);

  return c.json({
    orderNumber,
    orderId,
    razorpayOrderId: razorpayOrder.id,
    amountPaise: totals.totalPaise,
    currency: "INR",
    keyId: c.env.RAZORPAY_KEY_ID,
    prefill: { name: addr.fullName, email: user.email, contact: addr.phone },
    totals,
  });
});

export default checkout;
