# Deploying Mohini Artistry (Cloudflare free tier)

All steps use the free tier: D1, R2, Workers, and Pages all have generous free allowances that comfortably cover a boutique store. You'll need a Cloudflare account and (for real payments) a Razorpay account.

## 0. Prerequisites

```
npm install                     # from repo root — installs all workspaces
npx wrangler login               # from worker/ — authorizes wrangler against your Cloudflare account
```

## 1. Create the D1 database

```
cd worker
npx wrangler d1 create mohini-artistry-db
```

Copy the `database_id` it prints and paste it into **both** places in `worker/wrangler.toml` that currently say `REPLACE_WITH_D1_DATABASE_ID` (the top-level `[[d1_databases]]` block and the `[[env.production.d1_databases]]` block).

Apply migrations to the remote database:

```
npx wrangler d1 migrations apply mohini-artistry-db --remote
npx wrangler d1 execute mohini-artistry-db --remote --file=./seed.sql
```

## 2. Create the R2 bucket

```
npx wrangler r2 bucket create mohini-artistry-product-images
```

In the Cloudflare dashboard → R2 → `mohini-artistry-product-images` → Settings → enable **public access** (r2.dev subdomain). Copy the resulting `https://pub-XXXXXXXX.r2.dev` URL and put it in `worker/wrangler.toml` as `R2_PUBLIC_BASE_URL` (replacing both `REPLACE_WITH_R2_DEV_ID` placeholders), or configure a custom domain on the bucket instead if you have one.

## 3. Razorpay setup

1. Create a Razorpay account (test mode works without KYC; going live with real payments requires business KYC — this is external to the Cloudflare stack and has its own approval timeline, so start it early if you want to accept real payments soon).
2. From the Razorpay dashboard, grab your **Key ID** and **Key Secret** (Settings → API Keys). Use the test-mode keys until you're ready to go live.
3. Put the Key ID in `worker/wrangler.toml` under `RAZORPAY_KEY_ID` (both the top-level `[vars]` and `[env.production.vars]` blocks) — this one is public/non-secret by design (it's sent to the browser for Checkout.js).
4. The Key **Secret** and webhook secret are set as Worker secrets in step 4 below, never committed to `wrangler.toml`.
5. Webhook: after your first deploy (step 5), go to Razorpay Dashboard → Settings → Webhooks → Add New Webhook, URL = `https://<your-worker-subdomain>.workers.dev/api/payments/webhook`, active events: `payment.captured` and `payment.failed`. Razorpay will show you a webhook secret when you create it — that's your `RAZORPAY_WEBHOOK_SECRET`.

## 4. Set Worker secrets

```
cd worker
npx wrangler secret put JWT_SECRET
# paste a long random string, e.g. generate one with: openssl rand -base64 48

npx wrangler secret put RAZORPAY_KEY_SECRET
# paste your Razorpay Key Secret

npx wrangler secret put RAZORPAY_WEBHOOK_SECRET
# paste the webhook secret from step 3.5 (you can set this after the first deploy once the webhook exists)
```

## 5. Deploy the Worker

```
cd worker
npx wrangler deploy
```

Note the deployed URL (e.g. `https://mohini-artistry-api.<your-subdomain>.workers.dev`). Update:
- `frontend/.env.production` → `VITE_API_BASE_URL=https://mohini-artistry-api.<your-subdomain>.workers.dev/api`
- `worker/wrangler.toml` → `[env.production.vars] FRONTEND_ORIGIN` should match your eventual Pages URL (step 6) — redeploy the worker after updating this so CORS allows the frontend origin.

## 6. Deploy the frontend to Cloudflare Pages

Option A — dashboard (simplest): Cloudflare dashboard → Workers & Pages → Create → Pages → connect your git repo, set:
- Build command: `npm run build --workspace=frontend` (run from repo root) or `cd frontend && npm run build`
- Build output directory: `frontend/dist`
- Environment variable: `VITE_API_BASE_URL` = your deployed Worker URL + `/api`

Option B — CLI:
```
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=mohini-artistry
```

Once you have the Pages URL (e.g. `https://mohini-artistry.pages.dev`), go back to `worker/wrangler.toml`'s `[env.production.vars] FRONTEND_ORIGIN`, set it to that URL, and re-run `npx wrangler deploy` from `worker/` so CORS is locked to your real frontend origin (not `*`).

## 7. Bootstrap the first admin

There's no self-serve "become admin" UI — register a normal account through the live site first (`/register`), then promote it manually:

```
cd worker
npx wrangler d1 execute mohini-artistry-db --remote --command="UPDATE users SET is_admin = 1 WHERE email = 'your-email@example.com'"
```

Log out and back in (or just wait for the next `/auth/me` refresh) so the frontend picks up the admin flag, then visit `/admin`.

## 8. Smoke test

- Register → browse → add to cart → wishlist → checkout with a Razorpay **test** card/UPI ID → confirm the order flips to "Order Placed" → as admin, advance its status → track it via Order ID + email on `/track-order`.
- Confirm the Razorpay webhook is reachable: in the Razorpay dashboard, the webhook's recent-deliveries log should show 200 responses after a test payment.
- Confirm CORS: opening the deployed frontend and checking the browser console for CORS errors on API calls.

## Local development (no deployment)

```
npm install                                  # repo root
cd worker && cp .dev.vars.example .dev.vars  # fill in local secrets
npx wrangler d1 migrations apply mohini-artistry-db --local
npx wrangler d1 execute mohini-artistry-db --local --file=./seed.sql
npx wrangler dev --port 8787                 # from worker/

# separate terminal
cd frontend && npm run dev                   # runs on :5173, calls :8787 per .env.development
```
