import { Hono } from "hono";
import { adminCouponSchema, adminCouponUpdateSchema, type Coupon } from "@mohini-artistry/shared";
import type { Env, Variables } from "../../env";
import { requireAuth, requireAdmin } from "../../middleware/auth";
import { HttpError } from "../../middleware/errorHandler";
import { nowMs } from "../../lib/db";

const adminCoupons = new Hono<{ Bindings: Env; Variables: Variables }>();
adminCoupons.use("*", requireAuth, requireAdmin);

interface CouponRow {
  id: number;
  code: string;
  type: string;
  value: number;
  min_order_paise: number;
  max_discount_paise: number | null;
  is_active: number;
  starts_at: number | null;
  expires_at: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  created_at: number;
}

const COUPON_COLUMNS = `id, code, type, value, min_order_paise, max_discount_paise, is_active,
  starts_at, expires_at, usage_limit, usage_count, per_user_limit, created_at`;

function rowToCoupon(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    type: row.type as Coupon["type"],
    value: row.value,
    minOrderPaise: row.min_order_paise,
    maxDiscountPaise: row.max_discount_paise,
    isActive: row.is_active === 1,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    usageLimit: row.usage_limit,
    usageCount: row.usage_count,
    perUserLimit: row.per_user_limit,
    createdAt: row.created_at,
  };
}

adminCoupons.get("/", async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT ${COUPON_COLUMNS} FROM coupons ORDER BY created_at DESC`
  ).all<CouponRow>();
  return c.json((result.results ?? []).map(rowToCoupon));
});

adminCoupons.post("/", async (c) => {
  const body = adminCouponSchema.parse(await c.req.json());

  const existing = await c.env.DB.prepare("SELECT id FROM coupons WHERE code = ?")
    .bind(body.code)
    .first();
  if (existing) throw new HttpError(409, "A coupon with this code already exists.", "COUPON_EXISTS");

  const now = nowMs();
  const result = await c.env.DB.prepare(
    `INSERT INTO coupons (code, type, value, min_order_paise, max_discount_paise, is_active,
       starts_at, expires_at, usage_limit, usage_count, per_user_limit, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
  )
    .bind(
      body.code,
      body.type,
      body.value,
      body.minOrderPaise,
      body.maxDiscountPaise ?? null,
      body.isActive ? 1 : 0,
      body.startsAt ?? null,
      body.expiresAt ?? null,
      body.usageLimit ?? null,
      body.perUserLimit,
      now
    )
    .run();

  const id = result.meta.last_row_id as number;
  const row = await c.env.DB.prepare(`SELECT ${COUPON_COLUMNS} FROM coupons WHERE id = ?`)
    .bind(id)
    .first<CouponRow>();

  return c.json(row ? rowToCoupon(row) : null, 201);
});

adminCoupons.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid coupon id.", "VALIDATION_ERROR");

  const body = adminCouponUpdateSchema.parse(await c.req.json());

  const existing = await c.env.DB.prepare("SELECT id FROM coupons WHERE id = ?").bind(id).first();
  if (!existing) throw new HttpError(404, "Coupon not found.", "NOT_FOUND");

  const sets: string[] = [];
  const params: unknown[] = [];

  if (body.code !== undefined) {
    sets.push("code = ?");
    params.push(body.code);
  }
  if (body.type !== undefined) {
    sets.push("type = ?");
    params.push(body.type);
  }
  if (body.value !== undefined) {
    sets.push("value = ?");
    params.push(body.value);
  }
  if (body.minOrderPaise !== undefined) {
    sets.push("min_order_paise = ?");
    params.push(body.minOrderPaise);
  }
  if (body.maxDiscountPaise !== undefined) {
    sets.push("max_discount_paise = ?");
    params.push(body.maxDiscountPaise);
  }
  if (body.isActive !== undefined) {
    sets.push("is_active = ?");
    params.push(body.isActive ? 1 : 0);
  }
  if (body.startsAt !== undefined) {
    sets.push("starts_at = ?");
    params.push(body.startsAt);
  }
  if (body.expiresAt !== undefined) {
    sets.push("expires_at = ?");
    params.push(body.expiresAt);
  }
  if (body.usageLimit !== undefined) {
    sets.push("usage_limit = ?");
    params.push(body.usageLimit);
  }
  if (body.perUserLimit !== undefined) {
    sets.push("per_user_limit = ?");
    params.push(body.perUserLimit);
  }

  if (sets.length > 0) {
    params.push(id);
    await c.env.DB.prepare(`UPDATE coupons SET ${sets.join(", ")} WHERE id = ?`)
      .bind(...params)
      .run();
  }

  const row = await c.env.DB.prepare(`SELECT ${COUPON_COLUMNS} FROM coupons WHERE id = ?`)
    .bind(id)
    .first<CouponRow>();

  return c.json(row ? rowToCoupon(row) : null);
});

// Preserves coupon_redemptions history — never hard delete.
adminCoupons.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid coupon id.", "VALIDATION_ERROR");

  const result = await c.env.DB.prepare("UPDATE coupons SET is_active = 0 WHERE id = ?")
    .bind(id)
    .run();

  if (result.meta.changes === 0) throw new HttpError(404, "Coupon not found.", "NOT_FOUND");
  return c.json({ ok: true });
});

export default adminCoupons;
