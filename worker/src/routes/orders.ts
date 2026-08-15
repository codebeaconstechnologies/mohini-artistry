import { Hono } from "hono";
import { trackOrderSchema } from "@mohini-artistry/shared";
import type { Env, Variables } from "../env";
import { requireAuth } from "../middleware/auth";
import { rateLimit } from "../middleware/rateLimit";
import { HttpError } from "../middleware/errorHandler";
import { getOrdersForUser, getOrderByNumber } from "../lib/orders";

const orders = new Hono<{ Bindings: Env; Variables: Variables }>();

orders.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const list = await getOrdersForUser(c.env, user.id);
  return c.json(list);
});

orders.get("/:orderNumber", requireAuth, async (c) => {
  const user = c.get("user");
  const orderNumber = c.req.param("orderNumber");
  if (!orderNumber) throw new HttpError(404, "Order not found.", "ORDER_NOT_FOUND");
  const order = await getOrderByNumber(c.env, orderNumber);
  if (!order || !(await isOwnedByUser(c.env, order.id, user.id))) {
    throw new HttpError(404, "Order not found.", "ORDER_NOT_FOUND");
  }
  return c.json(order);
});

async function isOwnedByUser(env: Env, orderId: number, userId: number): Promise<boolean> {
  const row = await env.DB.prepare("SELECT 1 FROM orders WHERE id = ? AND user_id = ?")
    .bind(orderId, userId)
    .first();
  return !!row;
}

export default orders;

// Mounted separately at /api/track (not nested under /api/orders) to avoid any
// ambiguity with the /:orderNumber param route above.
export const trackRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// Public order tracking: Order ID + email must both match, or a generic 404 —
// never a field-level error, so this endpoint can't be used to enumerate orders/emails.
trackRouter.get(
  "/",
  rateLimit({ name: "track", windowSeconds: 60, maxRequests: 10 }),
  async (c) => {
    const parsed = trackOrderSchema.safeParse({
      orderNumber: c.req.query("orderNumber"),
      email: c.req.query("email"),
    });
    if (!parsed.success) {
      throw new HttpError(400, "Enter a valid Order ID and email address.", "VALIDATION_ERROR");
    }

    const order = await getOrderByNumber(c.env, parsed.data.orderNumber);
    if (!order || order.contactEmail.toLowerCase() !== parsed.data.email.toLowerCase()) {
      throw new HttpError(404, "No order found for that Order ID and email combination.", "NOT_FOUND");
    }

    return c.json(order);
  }
);
