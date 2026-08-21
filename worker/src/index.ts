import { Hono } from "hono";
import type { Env, Variables } from "./env";
import { corsMiddleware } from "./middleware/cors";
import { handleError } from "./middleware/errorHandler";
import { rateLimit } from "./middleware/rateLimit";
import auth from "./routes/auth";
import checkout from "./routes/checkout";
import payments from "./routes/payments";
import orders, { trackRouter } from "./routes/orders";
import returns from "./routes/returns";
import categories from "./routes/categories";
import products from "./routes/products";
import reviews from "./routes/reviews";
import wishlist from "./routes/wishlist";
import cart from "./routes/cart";
import coupons from "./routes/coupons";
import adminProducts from "./routes/admin/products";
import adminOrders from "./routes/admin/orders";
import adminReturns from "./routes/admin/returns";
import adminCoupons from "./routes/admin/coupons";
import adminUsers from "./routes/admin/users";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", corsMiddleware());
app.onError(handleError);

app.get("/api/health", (c) => c.json({ ok: true, service: "mohini-artistry-api" }));

app.use(
  "/api/auth/register",
  rateLimit({ name: "auth-register", windowSeconds: 3600, maxRequests: 10 })
);
app.use(
  "/api/auth/login",
  rateLimit({ name: "auth-login", windowSeconds: 900, maxRequests: 20 })
);
app.use(
  "/api/checkout/*",
  rateLimit({ name: "checkout", windowSeconds: 3600, maxRequests: 30 })
);

app.route("/api/auth", auth);
app.route("/api/checkout", checkout);
app.route("/api/payments", payments);
app.route("/api/orders", orders);
app.route("/api/track", trackRouter);
app.route("/api/returns", returns);

app.route("/api/categories", categories);
app.route("/api/products", products);
// reviews is mounted at the same /api/products prefix as the products router so
// public paths read as /api/products/:id/reviews — the two routers' path shapes
// (/:slug vs /:id/reviews) don't collide.
app.route("/api/products", reviews);
app.route("/api/wishlist", wishlist);
app.route("/api/cart", cart);
app.route("/api/coupons", coupons);

// ---- Admin routes (all require requireAuth + requireAdmin, enforced per-router) ----
app.route("/api/admin/products", adminProducts);
app.route("/api/admin/orders", adminOrders);
app.route("/api/admin/returns", adminReturns);
app.route("/api/admin/coupons", adminCoupons);
app.route("/api/admin/users", adminUsers);

export default app;
