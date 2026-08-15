import { Hono } from "hono";
import { createReviewSchema, type Review, type Paginated } from "@mohini-artistry/shared";
import type { Env, Variables } from "../env";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { nowMs } from "../lib/db";

// Mounted at /api/products (alongside routes/products.ts) so public paths read
// as /api/products/:id/reviews. This is a distinct path shape from products.ts's
// /:slug and /:slug/similar routes (two segments vs one/two-with-literal-suffix),
// so there's no route collision between the two routers sharing that prefix.
const reviews = new Hono<{ Bindings: Env; Variables: Variables }>();

interface ReviewRow {
  id: number;
  product_id: number;
  user_id: number;
  full_name: string;
  rating: number;
  comment: string | null;
  order_id: number | null;
  created_at: number;
}

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    userName: row.full_name,
    rating: row.rating,
    comment: row.comment,
    isVerifiedPurchase: row.order_id !== null,
    createdAt: row.created_at,
  };
}

reviews.get("/:id/reviews", async (c) => {
  const productId = Number(c.req.param("id"));
  if (!Number.isInteger(productId)) {
    throw new HttpError(400, "Invalid product id.", "VALIDATION_ERROR");
  }

  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(60, Math.max(1, Number(c.req.query("limit")) || 20));
  const offset = (page - 1) * limit;

  const countRow = await c.env.DB.prepare(
    "SELECT COUNT(*) AS count FROM reviews WHERE product_id = ?"
  )
    .bind(productId)
    .first<{ count: number }>();

  const result = await c.env.DB.prepare(
    `SELECT r.id, r.product_id, r.user_id, u.full_name, r.rating, r.comment, r.order_id, r.created_at
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC LIMIT ? OFFSET ?`
  )
    .bind(productId, limit, offset)
    .all<ReviewRow>();

  const items = (result.results ?? []).map(rowToReview);

  return c.json<Paginated<Review>>({ items, total: countRow?.count ?? 0, page, limit });
});

reviews.post("/:id/reviews", requireAuth, async (c) => {
  const user = c.get("user");
  const productId = Number(c.req.param("id"));
  if (!Number.isInteger(productId)) {
    throw new HttpError(400, "Invalid product id.", "VALIDATION_ERROR");
  }

  const body = createReviewSchema.parse(await c.req.json());

  const product = await c.env.DB.prepare("SELECT id FROM products WHERE id = ?")
    .bind(productId)
    .first();
  if (!product) throw new HttpError(404, "Product not found.", "NOT_FOUND");

  // Auto-detect verified purchase: most recent delivered order containing this product.
  const verifiedOrder = await c.env.DB.prepare(
    `SELECT o.id FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = ? AND o.status = 'delivered' AND oi.product_id = ?
     ORDER BY o.created_at DESC LIMIT 1`
  )
    .bind(user.id, productId)
    .first<{ id: number }>();

  const now = nowMs();

  await c.env.DB.prepare(
    `INSERT INTO reviews (product_id, user_id, order_id, rating, comment, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(product_id, user_id) DO UPDATE SET
       rating = excluded.rating,
       comment = excluded.comment,
       order_id = excluded.order_id`
  )
    .bind(productId, user.id, verifiedOrder?.id ?? null, body.rating, body.comment ?? null, now)
    .run();

  // Recompute rating_avg/rating_count from a fresh aggregate, not incrementally.
  const agg = await c.env.DB.prepare(
    "SELECT AVG(rating) AS avg_rating, COUNT(*) AS count FROM reviews WHERE product_id = ?"
  )
    .bind(productId)
    .first<{ avg_rating: number; count: number }>();

  await c.env.DB.prepare(
    "UPDATE products SET rating_avg = ?, rating_count = ?, updated_at = ? WHERE id = ?"
  )
    .bind(agg?.avg_rating ?? 0, agg?.count ?? 0, now, productId)
    .run();

  const row = await c.env.DB.prepare(
    `SELECT r.id, r.product_id, r.user_id, u.full_name, r.rating, r.comment, r.order_id, r.created_at
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ? AND r.user_id = ?`
  )
    .bind(productId, user.id)
    .first<ReviewRow>();

  return c.json(row ? rowToReview(row) : null, 201);
});

export default reviews;
