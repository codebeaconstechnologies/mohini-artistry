import type { Env } from "../env";
import { nowMs } from "./db";

export interface FulfillResult {
  updated: boolean;
  orderId: number;
}

/**
 * Idempotently flips an order from payment_status='pending' to 'verified' and
 * applies the one-time side effects (status history, stock decrement, cart
 * clear, coupon redemption). Safe to call from both the client-facing
 * /payments/verify route and the Razorpay webhook — whichever arrives first
 * does the work; the other becomes a no-op via the WHERE payment_status='pending' guard.
 */
export async function markOrderVerifiedAndFulfill(
  env: Env,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string | null
): Promise<FulfillResult | null> {
  const now = nowMs();

  const updateResult = await env.DB.prepare(
    `UPDATE orders
     SET payment_status = 'verified', payment_verified_at = ?, razorpay_payment_id = ?,
         razorpay_signature = COALESCE(?, razorpay_signature), updated_at = ?
     WHERE razorpay_order_id = ? AND payment_status = 'pending'`
  )
    .bind(now, razorpayPaymentId, razorpaySignature, now, razorpayOrderId)
    .run();

  if (updateResult.meta.changes === 0) {
    const existing = await env.DB.prepare(
      "SELECT id FROM orders WHERE razorpay_order_id = ? AND payment_status = 'verified'"
    )
      .bind(razorpayOrderId)
      .first<{ id: number }>();
    if (!existing) return null;
    return { updated: false, orderId: existing.id };
  }

  const order = await env.DB.prepare(
    "SELECT id, user_id, coupon_code FROM orders WHERE razorpay_order_id = ?"
  )
    .bind(razorpayOrderId)
    .first<{ id: number; user_id: number; coupon_code: string | null }>();
  if (!order) return null;

  const items = await env.DB.prepare(
    "SELECT product_id, quantity FROM order_items WHERE order_id = ?"
  )
    .bind(order.id)
    .all<{ product_id: number; quantity: number }>();

  const statements = [
    env.DB.prepare(
      `INSERT INTO order_status_history (order_id, status, note, created_at)
       VALUES (?, 'placed', 'Payment verified — order placed.', ?)`
    ).bind(order.id, now),
  ];

  for (const item of items.results ?? []) {
    // Allowed to go negative on a same-instant stock race; a paid order is never blocked.
    statements.push(
      env.DB.prepare(
        `UPDATE products SET stock = stock - ?, order_count = order_count + ?, updated_at = ? WHERE id = ?`
      ).bind(item.quantity, item.quantity, now, item.product_id)
    );
  }

  statements.push(
    env.DB.prepare(
      `DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = ?)`
    ).bind(order.user_id)
  );

  if (order.coupon_code) {
    const coupon = await env.DB.prepare("SELECT id FROM coupons WHERE code = ?")
      .bind(order.coupon_code)
      .first<{ id: number }>();
    if (coupon) {
      statements.push(
        env.DB.prepare(
          `INSERT INTO coupon_redemptions (coupon_id, user_id, order_id, redeemed_at) VALUES (?, ?, ?, ?)`
        ).bind(coupon.id, order.user_id, order.id, now)
      );
      statements.push(
        env.DB.prepare("UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?").bind(coupon.id)
      );
    }
  }

  await env.DB.batch(statements);

  return { updated: true, orderId: order.id };
}

export async function markOrderPaymentFailed(env: Env, razorpayOrderId: string): Promise<void> {
  const now = nowMs();
  await env.DB.prepare(
    `UPDATE orders SET payment_status = 'failed', updated_at = ?
     WHERE razorpay_order_id = ? AND payment_status = 'pending'`
  )
    .bind(now, razorpayOrderId)
    .run();
}
