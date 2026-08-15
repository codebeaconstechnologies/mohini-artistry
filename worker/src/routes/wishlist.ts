import { Hono } from "hono";
import type { Env, Variables } from "../env";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { nowMs } from "../lib/db";
import {
  PRODUCT_SELECT_COLUMNS,
  PRODUCT_FROM_CLAUSE,
  attachImages,
  type ProductRow,
} from "../lib/products";

const wishlist = new Hono<{ Bindings: Env; Variables: Variables }>();
wishlist.use("*", requireAuth);

wishlist.get("/", async (c) => {
  const user = c.get("user");
  const rows = await c.env.DB.prepare(
    `SELECT ${PRODUCT_SELECT_COLUMNS} ${PRODUCT_FROM_CLAUSE}
     JOIN wishlists w ON w.product_id = p.id
     WHERE w.user_id = ?
     ORDER BY w.added_at DESC`
  )
    .bind(user.id)
    .all<ProductRow>();

  const items = await attachImages(c.env, rows.results ?? []);
  return c.json(items);
});

wishlist.post("/:productId", async (c) => {
  const user = c.get("user");
  const productId = Number(c.req.param("productId"));
  if (!Number.isInteger(productId)) {
    throw new HttpError(400, "Invalid product id.", "VALIDATION_ERROR");
  }

  const product = await c.env.DB.prepare("SELECT id FROM products WHERE id = ?")
    .bind(productId)
    .first();
  if (!product) throw new HttpError(404, "Product not found.", "NOT_FOUND");

  // Idempotent: adding an already-wishlisted product is a no-op success.
  await c.env.DB.prepare(
    `INSERT INTO wishlists (user_id, product_id, added_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id, product_id) DO NOTHING`
  )
    .bind(user.id, productId, nowMs())
    .run();

  return c.json({ ok: true });
});

wishlist.delete("/:productId", async (c) => {
  const user = c.get("user");
  const productId = Number(c.req.param("productId"));
  if (!Number.isInteger(productId)) {
    throw new HttpError(400, "Invalid product id.", "VALIDATION_ERROR");
  }

  // Idempotent: removing an absent entry is a no-op success.
  await c.env.DB.prepare("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?")
    .bind(user.id, productId)
    .run();

  return c.json({ ok: true });
});

export default wishlist;
