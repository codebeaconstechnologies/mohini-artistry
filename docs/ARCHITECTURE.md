# Mohini Artistry — Architecture

## Stack

- **Frontend**: React + Vite SPA, deployed to Cloudflare Pages (free).
- **API**: Cloudflare Worker running Hono, deployed via `wrangler deploy`.
- **Database**: Cloudflare D1 (SQLite), free tier.
- **Image storage**: Cloudflare R2 (free tier), uploaded via the admin panel.
- **Payments**: Razorpay (Orders API + Checkout.js), India-focused (UPI/card/netbanking).
- **Auth**: Custom email+password, PBKDF2 hashing (Web Crypto), JWT (HS256) sessions.

## Repo layout

```
shared/    — types, constants, zod validation schemas shared by worker + frontend
worker/    — Hono API, D1 migrations, business logic
frontend/  — React SPA
```

npm workspaces tie them together; the worker and frontend both depend on `@mohini-artistry/shared`.

## Money handling

All monetary values are integers in **paise** (₹1 = 100 paise), matching Razorpay's API and avoiding float rounding. Never format/compute money as a JS float; always integer paise until the final display conversion (`paise / 100`).

## Pricing — single source of truth

`worker/src/lib/pricing.ts` exports `computeCartTotals()`, the only place shipping/discount/total math happens. It is called by both the live cart-summary preview and the final checkout charge, and always re-reads unit prices from `products` in D1 — never from client input or cached cart rows. This is what makes price/shipping/discount spoofing impossible: whatever the client sends, the server always recomputes from the database.

Rules:
- Subtotal > ₹1999 → free shipping (any order).
- First order (0 prior `payment_status='verified'` orders for that user) AND subtotal > ₹500 → free shipping.
- Otherwise a flat ₹79 shipping fee applies.
- An admin-managed coupon (percent / flat / free_shipping) can stack a discount or force free shipping, always validated server-side (active flag, date window, min order, usage limits) via `worker/src/lib/coupons.ts`.

## Order lifecycle & the "DraftOrder" concept

The user's cart (`carts`/`cart_items` tables) *is* the DraftOrder — a DB-persisted, per-user, unpaid basket. No row in `orders` exists until checkout starts.

An `orders` row is created the moment Razorpay Checkout opens (`payment_status='pending'`), before payment is confirmed. Until `payment_status` flips to `'verified'`, the order should still read as **"DraftOrder"** to the customer — see `getOrderDisplayStatus(status, paymentStatus)` in `shared/src/constants/order-status.ts`, which is the single place this display logic lives (frontend and any future backend consumer both call it rather than re-deriving the label). Once `payment_status='verified'`, the real lifecycle applies: Order Placed → Order Prepared → Order Shipped → Order Delivered (or Cancelled), tracked in `order_status_history` and advanced only through forward-only transitions (`ORDER_STATUS_TRANSITIONS` in the same file) by an admin.

## Anti-fraud / payment verification

Two independent confirmation paths both call `worker/src/lib/orderFulfillment.ts`'s `markOrderVerifiedAndFulfill()`, which is idempotent (guarded by `WHERE payment_status = 'pending'` on the flipping UPDATE, so whichever path arrives first does the work and the second becomes a no-op):

1. **`POST /api/payments/verify`** — called by the frontend right after Razorpay's Checkout.js success callback. Verifies the HMAC signature Razorpay returned using `RAZORPAY_KEY_SECRET` (a Worker secret, never sent to the browser). This is the fast-path UX confirmation.
2. **`POST /api/payments/webhook`** — Razorpay calling the Worker directly, signed with a separate `RAZORPAY_WEBHOOK_SECRET` over the raw request body. This is the **authoritative** confirmation: it's signed by Razorpay server-to-server, so it can't be forged from the browser, and it still fires even if the customer closes the tab right after paying (before `/verify` would have run).

A forged client call to `/verify` with a fabricated signature is rejected (signature check fails before any DB write happens) and never places an order.

## Auth & admin gating

JWT sessions (7-day expiry) are issued on login/register and verified on every authenticated request by `worker/src/middleware/auth.ts`'s `requireAuth`. Admin routes additionally run `requireAdmin`, which **re-checks `is_admin` from D1 on every request** rather than trusting the JWT's `isAdmin` claim — so revoking someone's admin access takes effect immediately rather than waiting up to 7 days for their token to expire.

There's no self-serve "become admin" flow. The first admin is bootstrapped with one manual SQL command after registering a normal account — see `docs/DEPLOYMENT.md`.

## Rate limiting

Workers Free has no built-in rate limiting or Durable Objects, so `worker/src/middleware/rateLimit.ts` implements a simple D1-backed sliding-window limiter, applied to `/auth/register`, `/auth/login`, `/checkout/*`, and `/track` (public, so it's the most exposed to abuse/enumeration attempts).
