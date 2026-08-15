import { Hono } from "hono";
import { validateCouponSchema, type CartTotals } from "@mohini-artistry/shared";
import type { Env, Variables } from "../env";
import { requireAuth } from "../middleware/auth";
import { getFreshCartItems } from "../lib/cart";
import { validateCoupon, isFirstOrder } from "../lib/coupons";
import { computeCartTotals } from "../lib/pricing";

const coupons = new Hono<{ Bindings: Env; Variables: Variables }>();
coupons.use("*", requireAuth);

coupons.post("/validate", async (c) => {
  const user = c.get("user");
  const body = validateCouponSchema.parse(await c.req.json());

  const items = await getFreshCartItems(c.env, user.id);
  const subtotalPaise = items.reduce((sum, i) => sum + i.unitPricePaise * i.quantity, 0);

  const result = await validateCoupon(c.env, body.code, user.id, subtotalPaise);

  if (!result.ok || !result.coupon) {
    return c.json({ ok: false, reason: result.reason });
  }

  const firstOrder = await isFirstOrder(c.env, user.id);
  const preview: CartTotals = computeCartTotals({
    items: items.map((i) => ({ unitPricePaise: i.unitPricePaise, quantity: i.quantity })),
    isFirstOrder: firstOrder,
    coupon: result.coupon,
  });

  return c.json({ ok: true, preview });
});

export default coupons;
