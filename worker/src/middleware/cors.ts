import { cors } from "hono/cors";
import type { Env } from "../env";

export function corsMiddleware() {
  return cors({
    origin: (origin, c) => {
      const allowed = (c.env as Env).FRONTEND_ORIGIN.split(",").map((o) => o.trim());
      if (!origin) return allowed[0];
      return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 600,
  });
}
