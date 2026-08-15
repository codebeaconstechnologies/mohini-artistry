import { Hono } from "hono";
import { z } from "zod";
import type { User, Paginated } from "@mohini-artistry/shared";
import type { Env, Variables } from "../../env";
import { requireAuth, requireAdmin } from "../../middleware/auth";
import { HttpError } from "../../middleware/errorHandler";
import { nowMs } from "../../lib/db";

const adminUsers = new Hono<{ Bindings: Env; Variables: Variables }>();
adminUsers.use("*", requireAuth, requireAdmin);

interface UserRow {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  is_admin: number;
  created_at: number;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    isAdmin: row.is_admin === 1,
    createdAt: row.created_at,
  };
}

adminUsers.get("/", async (c) => {
  const search = c.req.query("search");
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(c.req.query("limit")) || 20));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];
  if (search) {
    conditions.push("email LIKE ?");
    params.push(`%${search}%`);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRow = await c.env.DB.prepare(`SELECT COUNT(*) AS count FROM users ${whereClause}`)
    .bind(...params)
    .first<{ count: number }>();

  // password_hash is intentionally never selected here.
  const result = await c.env.DB.prepare(
    `SELECT id, email, full_name, phone, is_admin, created_at FROM users ${whereClause}
     ORDER BY created_at DESC LIMIT ? OFFSET ?`
  )
    .bind(...params, limit, offset)
    .all<UserRow>();

  return c.json<Paginated<User>>({
    items: (result.results ?? []).map(rowToUser),
    total: countRow?.count ?? 0,
    page,
    limit,
  });
});

// Not in shared/validation/schemas.ts — small enough to keep local to this route.
const updateAdminStatusSchema = z.object({ isAdmin: z.boolean() });

adminUsers.patch("/:id", async (c) => {
  const currentUser = c.get("user");
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid user id.", "VALIDATION_ERROR");

  const body = updateAdminStatusSchema.parse(await c.req.json());

  if (id === currentUser.id && !body.isAdmin) {
    throw new HttpError(
      400,
      "You cannot remove your own admin access.",
      "SELF_DEMOTE_FORBIDDEN"
    );
  }

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(id).first();
  if (!existing) throw new HttpError(404, "User not found.", "NOT_FOUND");

  await c.env.DB.prepare("UPDATE users SET is_admin = ?, updated_at = ? WHERE id = ?")
    .bind(body.isAdmin ? 1 : 0, nowMs(), id)
    .run();

  const row = await c.env.DB.prepare(
    "SELECT id, email, full_name, phone, is_admin, created_at FROM users WHERE id = ?"
  )
    .bind(id)
    .first<UserRow>();

  return c.json(row ? rowToUser(row) : null);
});

export default adminUsers;
