import { Hono } from "hono";
import { z } from "zod";
import { adminProductSchema, adminProductUpdateSchema } from "@mohini-artistry/shared";
import type { Env, Variables } from "../../env";
import { requireAuth, requireAdmin } from "../../middleware/auth";
import { HttpError } from "../../middleware/errorHandler";
import { nowMs } from "../../lib/db";
import { slugify } from "../../lib/slug";
import {
  PRODUCT_SELECT_COLUMNS,
  PRODUCT_FROM_CLAUSE,
  attachImages,
  type ProductRow,
} from "../../lib/products";

const adminProducts = new Hono<{ Bindings: Env; Variables: Variables }>();
adminProducts.use("*", requireAuth, requireAdmin);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function extensionFromMime(mime: string): string | null {
  return MIME_EXTENSIONS[mime] ?? null;
}

function extensionFromName(name: string): string | null {
  const match = /\.([a-zA-Z0-9]+)$/.exec(name);
  return match ? match[1]!.toLowerCase() : null;
}

// ---- Product CRUD ----

adminProducts.get("/", async (c) => {
  const search = c.req.query("search");
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(c.req.query("limit")) || 20));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];
  if (search) {
    conditions.push("p.name LIKE ?");
    params.push(`%${search}%`);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRow = await c.env.DB.prepare(
    `SELECT COUNT(*) AS count ${PRODUCT_FROM_CLAUSE} ${whereClause}`
  )
    .bind(...params)
    .first<{ count: number }>();

  const rows = await c.env.DB.prepare(
    `SELECT ${PRODUCT_SELECT_COLUMNS} ${PRODUCT_FROM_CLAUSE} ${whereClause} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
  )
    .bind(...params, limit, offset)
    .all<ProductRow>();

  const items = await attachImages(c.env, rows.results ?? []);
  return c.json({ items, total: countRow?.count ?? 0, page, limit });
});

adminProducts.post("/", async (c) => {
  const body = adminProductSchema.parse(await c.req.json());

  const category = await c.env.DB.prepare("SELECT id FROM categories WHERE slug = ?")
    .bind(body.categorySlug)
    .first<{ id: number }>();
  if (!category) throw new HttpError(400, "Unknown category.", "VALIDATION_ERROR");

  const baseSlug = slugify(body.name);
  let slug = baseSlug;
  let suffix = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await c.env.DB.prepare("SELECT id FROM products WHERE slug = ?").bind(slug).first()) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  const now = nowMs();
  const result = await c.env.DB.prepare(
    `INSERT INTO products (
       slug, name, category_id, description, price_paise, compare_at_paise, stock,
       is_new_arrival, is_bestseller, is_active, rating_avg, rating_count, order_count,
       created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?)`
  )
    .bind(
      slug,
      body.name,
      category.id,
      body.description,
      body.pricePaise,
      body.compareAtPaise ?? null,
      body.stock,
      body.isNewArrival ? 1 : 0,
      body.isBestseller ? 1 : 0,
      body.isActive ? 1 : 0,
      now,
      now
    )
    .run();

  const productId = result.meta.last_row_id as number;

  const row = await c.env.DB.prepare(
    `SELECT ${PRODUCT_SELECT_COLUMNS} ${PRODUCT_FROM_CLAUSE} WHERE p.id = ?`
  )
    .bind(productId)
    .first<ProductRow>();
  const [product] = await attachImages(c.env, row ? [row] : []);

  return c.json(product, 201);
});

adminProducts.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid product id.", "VALIDATION_ERROR");

  const body = adminProductUpdateSchema.parse(await c.req.json());

  const existing = await c.env.DB.prepare("SELECT id FROM products WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) throw new HttpError(404, "Product not found.", "NOT_FOUND");

  const sets: string[] = [];
  const params: unknown[] = [];

  if (body.name !== undefined) {
    sets.push("name = ?");
    params.push(body.name);
  }
  if (body.categorySlug !== undefined) {
    const category = await c.env.DB.prepare("SELECT id FROM categories WHERE slug = ?")
      .bind(body.categorySlug)
      .first<{ id: number }>();
    if (!category) throw new HttpError(400, "Unknown category.", "VALIDATION_ERROR");
    sets.push("category_id = ?");
    params.push(category.id);
  }
  if (body.description !== undefined) {
    sets.push("description = ?");
    params.push(body.description);
  }
  if (body.pricePaise !== undefined) {
    sets.push("price_paise = ?");
    params.push(body.pricePaise);
  }
  if (body.compareAtPaise !== undefined) {
    sets.push("compare_at_paise = ?");
    params.push(body.compareAtPaise);
  }
  if (body.stock !== undefined) {
    sets.push("stock = ?");
    params.push(body.stock);
  }
  if (body.isNewArrival !== undefined) {
    sets.push("is_new_arrival = ?");
    params.push(body.isNewArrival ? 1 : 0);
  }
  if (body.isBestseller !== undefined) {
    sets.push("is_bestseller = ?");
    params.push(body.isBestseller ? 1 : 0);
  }
  if (body.isActive !== undefined) {
    sets.push("is_active = ?");
    params.push(body.isActive ? 1 : 0);
  }

  sets.push("updated_at = ?");
  params.push(nowMs());
  params.push(id);

  await c.env.DB.prepare(`UPDATE products SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...params)
    .run();

  const row = await c.env.DB.prepare(
    `SELECT ${PRODUCT_SELECT_COLUMNS} ${PRODUCT_FROM_CLAUSE} WHERE p.id = ?`
  )
    .bind(id)
    .first<ProductRow>();
  const [product] = await attachImages(c.env, row ? [row] : []);

  return c.json(product);
});

// Soft delete only — order_items may reference this product.
adminProducts.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid product id.", "VALIDATION_ERROR");

  const result = await c.env.DB.prepare(
    "UPDATE products SET is_active = 0, updated_at = ? WHERE id = ?"
  )
    .bind(nowMs(), id)
    .run();

  if (result.meta.changes === 0) throw new HttpError(404, "Product not found.", "NOT_FOUND");
  return c.json({ ok: true });
});

// ---- Product images ----
// Upload field name convention: "file".

adminProducts.post("/:id/images", async (c) => {
  const productId = Number(c.req.param("id"));
  if (!Number.isInteger(productId)) {
    throw new HttpError(400, "Invalid product id.", "VALIDATION_ERROR");
  }

  const product = await c.env.DB.prepare("SELECT id FROM products WHERE id = ?")
    .bind(productId)
    .first();
  if (!product) throw new HttpError(404, "Product not found.", "NOT_FOUND");

  const body = await c.req.parseBody();
  const file = body["file"];
  if (!file || !(file instanceof File)) {
    throw new HttpError(400, "No image file uploaded. Use form field name 'file'.", "VALIDATION_ERROR");
  }
  if (!file.type.startsWith("image/")) {
    throw new HttpError(400, "Uploaded file must be an image.", "VALIDATION_ERROR");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new HttpError(400, "Image must be 5MB or smaller.", "VALIDATION_ERROR");
  }

  const ext = extensionFromMime(file.type) ?? extensionFromName(file.name) ?? "jpg";
  const key = `products/${productId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  await c.env.PRODUCT_IMAGES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const url = `${c.env.R2_PUBLIC_BASE_URL}/${key}`;

  const existingImages = await c.env.DB.prepare(
    "SELECT COALESCE(MAX(sort_order), -1) AS max_sort, COUNT(*) AS count FROM product_images WHERE product_id = ?"
  )
    .bind(productId)
    .first<{ max_sort: number; count: number }>();

  const sortOrder = (existingImages?.max_sort ?? -1) + 1;
  const isPrimary = (existingImages?.count ?? 0) === 0;

  const result = await c.env.DB.prepare(
    `INSERT INTO product_images (product_id, r2_key, url, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)`
  )
    .bind(productId, key, url, sortOrder, isPrimary ? 1 : 0)
    .run();

  const imageId = result.meta.last_row_id as number;

  return c.json(
    {
      id: imageId,
      productId,
      url,
      sortOrder,
      isPrimary,
    },
    201
  );
});

adminProducts.delete("/:id/images/:imageId", async (c) => {
  const productId = Number(c.req.param("id"));
  const imageId = Number(c.req.param("imageId"));
  if (!Number.isInteger(productId) || !Number.isInteger(imageId)) {
    throw new HttpError(400, "Invalid id.", "VALIDATION_ERROR");
  }

  const image = await c.env.DB.prepare(
    "SELECT id, r2_key, is_primary FROM product_images WHERE id = ? AND product_id = ?"
  )
    .bind(imageId, productId)
    .first<{ id: number; r2_key: string; is_primary: number }>();

  if (!image) throw new HttpError(404, "Image not found.", "NOT_FOUND");

  await c.env.PRODUCT_IMAGES.delete(image.r2_key);
  await c.env.DB.prepare("DELETE FROM product_images WHERE id = ?").bind(imageId).run();

  if (image.is_primary === 1) {
    const next = await c.env.DB.prepare(
      "SELECT id FROM product_images WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1"
    )
      .bind(productId)
      .first<{ id: number }>();
    if (next) {
      await c.env.DB.prepare("UPDATE product_images SET is_primary = 1 WHERE id = ?")
        .bind(next.id)
        .run();
    }
  }

  return c.json({ ok: true });
});

const reorderSchema = z.array(
  z.object({
    imageId: z.number().int().positive(),
    sortOrder: z.number().int().min(0),
    isPrimary: z.boolean(),
  })
);

adminProducts.put("/:id/images/reorder", async (c) => {
  const productId = Number(c.req.param("id"));
  if (!Number.isInteger(productId)) {
    throw new HttpError(400, "Invalid product id.", "VALIDATION_ERROR");
  }

  const body = reorderSchema.parse(await c.req.json());

  const primaryCount = body.filter((item) => item.isPrimary).length;
  if (primaryCount > 1) {
    throw new HttpError(400, "Only one image can be marked primary.", "VALIDATION_ERROR");
  }

  if (body.length > 0) {
    const statements = [];
    // If this payload designates a new primary, clear the flag on every image
    // for this product first — otherwise an existing primary image that isn't
    // part of this payload (e.g. a partial reorder) could be left set alongside it.
    if (primaryCount === 1) {
      statements.push(
        c.env.DB.prepare("UPDATE product_images SET is_primary = 0 WHERE product_id = ?").bind(
          productId
        )
      );
    }
    for (const item of body) {
      statements.push(
        c.env.DB.prepare(
          "UPDATE product_images SET sort_order = ?, is_primary = ? WHERE id = ? AND product_id = ?"
        ).bind(item.sortOrder, item.isPrimary ? 1 : 0, item.imageId, productId)
      );
    }
    await c.env.DB.batch(statements);
  }

  const rows = await c.env.DB.prepare(
    "SELECT id, product_id, url, sort_order, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order ASC"
  )
    .bind(productId)
    .all<{ id: number; product_id: number; url: string; sort_order: number; is_primary: number }>();

  const items = (rows.results ?? []).map((r) => ({
    id: r.id,
    productId: r.product_id,
    url: r.url,
    sortOrder: r.sort_order,
    isPrimary: r.is_primary === 1,
  }));

  return c.json(items);
});

export default adminProducts;
