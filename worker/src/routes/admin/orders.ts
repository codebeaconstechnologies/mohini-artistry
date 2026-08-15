import { Hono } from "hono";
import { adminOrderStatusSchema, ORDER_STATUS_TRANSITIONS, type OrderStatus } from "@mohini-artistry/shared";
import type { Env, Variables } from "../../env";
import { requireAuth, requireAdmin } from "../../middleware/auth";
import { HttpError } from "../../middleware/errorHandler";
import { nowMs } from "../../lib/db";
import { getAllOrdersAdmin, getOrderById } from "../../lib/orders";

const adminOrders = new Hono<{ Bindings: Env; Variables: Variables }>();
adminOrders.use("*", requireAuth, requireAdmin);

adminOrders.get("/", async (c) => {
  const status = c.req.query("status");
  const search = c.req.query("search");
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(c.req.query("limit")) || 20));

  const result = await getAllOrdersAdmin(c.env, { status, search, page, limit });
  return c.json({ items: result.items, total: result.total, page, limit });
});

adminOrders.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid order id.", "VALIDATION_ERROR");

  const order = await getOrderById(c.env, id);
  if (!order) throw new HttpError(404, "Order not found.", "NOT_FOUND");

  return c.json(order);
});

adminOrders.patch("/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid order id.", "VALIDATION_ERROR");

  const body = adminOrderStatusSchema.parse(await c.req.json());

  const order = await c.env.DB.prepare(
    "SELECT id, status, payment_status FROM orders WHERE id = ?"
  )
    .bind(id)
    .first<{ id: number; status: OrderStatus; payment_status: string }>();

  if (!order) throw new HttpError(404, "Order not found.", "NOT_FOUND");

  // An order isn't really "placed" from the customer's point of view until
  // payment is verified — see getOrderDisplayStatus in shared/order-status.ts.
  if (order.payment_status !== "verified") {
    throw new HttpError(
      409,
      "This order's payment has not been verified yet, so its status cannot be advanced.",
      "PAYMENT_NOT_VERIFIED"
    );
  }

  const nextStatus = body.status as OrderStatus;
  const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new HttpError(
      400,
      `Cannot move an order from "${order.status}" to "${nextStatus}".`,
      "INVALID_TRANSITION"
    );
  }

  const now = nowMs();
  await c.env.DB.prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?")
    .bind(nextStatus, now, id)
    .run();

  await c.env.DB.prepare(
    "INSERT INTO order_status_history (order_id, status, note, created_at) VALUES (?, ?, ?, ?)"
  )
    .bind(id, nextStatus, body.note ?? null, now)
    .run();

  const updated = await getOrderById(c.env, id);
  return c.json(updated);
});

export default adminOrders;
