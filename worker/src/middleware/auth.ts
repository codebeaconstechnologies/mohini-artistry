import type { Context, Next } from "hono";
import type { Env, Variables } from "../env";
import { verifyJwt } from "../lib/jwt";
import { HttpError } from "./errorHandler";

type Ctx = Context<{ Bindings: Env; Variables: Variables }>;

export async function requireAuth(c: Ctx, next: Next) {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "You must be logged in.", "UNAUTHENTICATED");

  const payload = await verifyJwt(token, c.env.JWT_SECRET);
  if (!payload) throw new HttpError(401, "Your session has expired. Please log in again.", "INVALID_TOKEN");

  c.set("user", { id: payload.sub, email: payload.email, isAdmin: payload.isAdmin });
  await next();
}

/** Must run after requireAuth. Re-checks is_admin from D1 so revoking admin access takes effect immediately. */
export async function requireAdmin(c: Ctx, next: Next) {
  const user = c.get("user");
  if (!user) throw new HttpError(401, "You must be logged in.", "UNAUTHENTICATED");

  const row = await c.env.DB.prepare("SELECT is_admin FROM users WHERE id = ?")
    .bind(user.id)
    .first<{ is_admin: number }>();

  if (!row || row.is_admin !== 1) {
    throw new HttpError(403, "Admin access required.", "FORBIDDEN");
  }
  await next();
}
