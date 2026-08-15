import { Hono } from "hono";
import type { Product, Paginated } from "@mohini-artistry/shared";
import type { Env, Variables } from "../env";
import { HttpError } from "../middleware/errorHandler";
import {
  PRODUCT_SELECT_COLUMNS,
  PRODUCT_FROM_CLAUSE,
  attachImages,
  type ProductRow,
} from "../lib/products";

const products = new Hono<{ Bindings: Env; Variables: Variables }>();

/** GET / — public product listing with filters, sort, search and pagination. */
products.get("/", async (c) => {
  const q = c.req.query();

  const conditions: string[] = ["p.is_active = 1"];
  const params: unknown[] = [];

  if (q.category) {
    conditions.push("c.slug = ?");
    params.push(q.category);
  }
  if (q.minPrice) {
    conditions.push("p.price_paise >= ?");
    params.push(Number(q.minPrice));
  }
  if (q.maxPrice) {
    conditions.push("p.price_paise <= ?");
    params.push(Number(q.maxPrice));
  }
  if (q.bestseller === "true") {
    conditions.push("p.is_bestseller = 1");
  }
  if (q.mostLoved === "true") {
    conditions.push("p.rating_avg >= 4");
  }
  if (q.search) {
    conditions.push("p.name LIKE ?");
    params.push(`%${q.search}%`);
  }

  let orderBy = "p.is_bestseller DESC, p.rating_avg DESC, p.created_at DESC"; // "featured" default
  if (q.sort === "price_asc") orderBy = "p.price_paise ASC";
  else if (q.sort === "price_desc") orderBy = "p.price_paise DESC";
  else if (q.sort === "newest") orderBy = "p.created_at DESC";
  else if (q.sort === "rating") orderBy = "p.rating_avg DESC";
  else if (!q.sort && q.topRated === "true") orderBy = "p.rating_avg DESC";

  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(60, Math.max(1, Number(q.limit) || 20));
  const offset = (page - 1) * limit;

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const countRow = await c.env.DB.prepare(
    `SELECT COUNT(*) AS count ${PRODUCT_FROM_CLAUSE} ${whereClause}`
  )
    .bind(...params)
    .first<{ count: number }>();

  const rows = await c.env.DB.prepare(
    `SELECT ${PRODUCT_SELECT_COLUMNS} ${PRODUCT_FROM_CLAUSE} ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
  )
    .bind(...params, limit, offset)
    .all<ProductRow>();

  const items = await attachImages(c.env, rows.results ?? []);

  return c.json<Paginated<Product>>({ items, total: countRow?.count ?? 0, page, limit });
});

/** GET /new-arrivals — must be registered before /:slug. */
products.get("/new-arrivals", async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT ${PRODUCT_SELECT_COLUMNS} ${PRODUCT_FROM_CLAUSE}
     WHERE p.is_new_arrival = 1 AND p.is_active = 1
     ORDER BY p.created_at DESC LIMIT 12`
  ).all<ProductRow>();

  const items = await attachImages(c.env, rows.results ?? []);
  return c.json(items);
});

/** GET /most-loved — must be registered before /:slug. */
products.get("/most-loved", async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT ${PRODUCT_SELECT_COLUMNS} ${PRODUCT_FROM_CLAUSE}
     WHERE p.is_active = 1
     ORDER BY p.rating_avg DESC, p.order_count DESC LIMIT 12`
  ).all<ProductRow>();

  const items = await attachImages(c.env, rows.results ?? []);
  return c.json(items);
});

products.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const row = await c.env.DB.prepare(
    `SELECT ${PRODUCT_SELECT_COLUMNS} ${PRODUCT_FROM_CLAUSE} WHERE p.slug = ?`
  )
    .bind(slug)
    .first<ProductRow>();

  if (!row || row.is_active !== 1) {
    throw new HttpError(404, "Product not found.", "NOT_FOUND");
  }

  const [product] = await attachImages(c.env, [row]);
  return c.json(product);
});

products.get("/:slug/similar", async (c) => {
  const slug = c.req.param("slug");
  const base = await c.env.DB.prepare(
    "SELECT id, category_id FROM products WHERE slug = ? AND is_active = 1"
  )
    .bind(slug)
    .first<{ id: number; category_id: number }>();

  if (!base) throw new HttpError(404, "Product not found.", "NOT_FOUND");

  const rows = await c.env.DB.prepare(
    `SELECT ${PRODUCT_SELECT_COLUMNS} ${PRODUCT_FROM_CLAUSE}
     WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
     ORDER BY p.rating_avg DESC LIMIT 8`
  )
    .bind(base.category_id, base.id)
    .all<ProductRow>();

  const items = await attachImages(c.env, rows.results ?? []);
  return c.json(items);
});

export default products;
