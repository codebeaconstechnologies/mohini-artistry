import { Hono } from "hono";
import { registerSchema, loginSchema, type User, type AuthResponse } from "@mohini-artistry/shared";
import type { Env, Variables } from "../env";
import { hashPassword, verifyPassword } from "../lib/password";
import { signJwt } from "../lib/jwt";
import { nowMs } from "../lib/db";
import { HttpError } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

function toPublicUser(row: {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  is_admin: number;
  created_at: number;
}): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    isAdmin: row.is_admin === 1,
    createdAt: row.created_at,
  };
}

auth.post("/register", async (c) => {
  const body = registerSchema.parse(await c.req.json());

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(body.email)
    .first();
  if (existing) throw new HttpError(409, "An account with this email already exists.", "EMAIL_TAKEN");

  const passwordHash = await hashPassword(body.password);
  const now = nowMs();

  const result = await c.env.DB.prepare(
    `INSERT INTO users (email, password_hash, full_name, phone, is_admin, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`
  )
    .bind(body.email, passwordHash, body.fullName, body.phone ?? null, now, now)
    .run();

  const userId = result.meta.last_row_id as number;

  await c.env.DB.prepare(
    `INSERT INTO carts (user_id, created_at, updated_at) VALUES (?, ?, ?)`
  )
    .bind(userId, now, now)
    .run();

  const user: User = {
    id: userId,
    email: body.email,
    fullName: body.fullName,
    phone: body.phone ?? null,
    isAdmin: false,
    createdAt: now,
  };

  const token = await signJwt({ sub: userId, email: user.email, isAdmin: false }, c.env.JWT_SECRET);

  return c.json<AuthResponse>({ token, user }, 201);
});

auth.post("/login", async (c) => {
  const body = loginSchema.parse(await c.req.json());

  const row = await c.env.DB.prepare(
    "SELECT id, email, password_hash, full_name, phone, is_admin, created_at FROM users WHERE email = ?"
  )
    .bind(body.email)
    .first<{
      id: number;
      email: string;
      password_hash: string;
      full_name: string;
      phone: string | null;
      is_admin: number;
      created_at: number;
    }>();

  if (!row) throw new HttpError(401, "Invalid email or password.", "INVALID_CREDENTIALS");

  const valid = await verifyPassword(body.password, row.password_hash);
  if (!valid) throw new HttpError(401, "Invalid email or password.", "INVALID_CREDENTIALS");

  const user = toPublicUser(row);
  const token = await signJwt({ sub: user.id, email: user.email, isAdmin: user.isAdmin }, c.env.JWT_SECRET);

  return c.json<AuthResponse>({ token, user });
});

auth.get("/me", requireAuth, async (c) => {
  const authUser = c.get("user");
  const row = await c.env.DB.prepare(
    "SELECT id, email, full_name, phone, is_admin, created_at FROM users WHERE id = ?"
  )
    .bind(authUser.id)
    .first<{
      id: number;
      email: string;
      full_name: string;
      phone: string | null;
      is_admin: number;
      created_at: number;
    }>();

  if (!row) throw new HttpError(404, "User not found.");
  return c.json<User>(toPublicUser(row));
});

export default auth;
