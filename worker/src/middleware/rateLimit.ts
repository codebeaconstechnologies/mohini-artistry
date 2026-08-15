import type { Context, Next } from "hono";
import type { Env, Variables } from "../env";
import { HttpError } from "./errorHandler";
import { nowMs } from "../lib/db";

type Ctx = Context<{ Bindings: Env; Variables: Variables }>;

interface RateLimitOptions {
  /** Logical name for this limiter, used as part of the bucket key. */
  name: string;
  windowSeconds: number;
  maxRequests: number;
  /** Defaults to client IP. Override to key by e.g. user id for authenticated routes. */
  keyFn?: (c: Ctx) => string;
}

function clientIp(c: Ctx): string {
  return c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For") ?? "unknown";
}

/**
 * App-level sliding-window rate limiter backed by D1, since Workers Free has
 * no built-in rate limiting / Durable Objects. Good enough at this store's scale.
 */
export function rateLimit(options: RateLimitOptions) {
  return async (c: Ctx, next: Next) => {
    const key = `${options.name}:${(options.keyFn ?? clientIp)(c)}`;
    const now = nowMs();
    const windowStart = now - options.windowSeconds * 1000;

    const countRow = await c.env.DB.prepare(
      "SELECT COUNT(*) AS count FROM rate_limit_events WHERE bucket_key = ? AND created_at > ?"
    )
      .bind(key, windowStart)
      .first<{ count: number }>();

    if (countRow && countRow.count >= options.maxRequests) {
      throw new HttpError(429, "Too many requests. Please slow down and try again shortly.", "RATE_LIMITED");
    }

    await c.env.DB.prepare("INSERT INTO rate_limit_events (bucket_key, created_at) VALUES (?, ?)")
      .bind(key, now)
      .run();

    // Best-effort pruning so the table doesn't grow unbounded (~1% of requests).
    if (Math.random() < 0.01) {
      c.executionCtx.waitUntil(
        c.env.DB.prepare("DELETE FROM rate_limit_events WHERE created_at < ?")
          .bind(now - 24 * 60 * 60 * 1000)
          .run()
      );
    }

    await next();
  };
}
