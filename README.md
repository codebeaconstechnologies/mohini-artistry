# Mohini Artistry

A handmade-craft e-commerce site — Instant Rangoli, Resin Reflections, and Fabric Canvas Art — built to run entirely on Cloudflare's free tier.

- **Frontend**: React + Vite SPA (`frontend/`), deployed to Cloudflare Pages
- **API**: Hono on Cloudflare Workers (`worker/`), backed by Cloudflare D1
- **Images**: Cloudflare R2
- **Payments**: Razorpay (UPI/card/netbanking)
- **Shared contract**: types, constants, and zod validation schemas in `shared/`, used by both the worker and the frontend

See `docs/ARCHITECTURE.md` for how the pieces fit together (pricing engine, order lifecycle, payment anti-fraud model) and `docs/DEPLOYMENT.md` for step-by-step setup and deployment instructions, including local development.

## Quick start (local dev)

```
npm install
cd worker && cp .dev.vars.example .dev.vars   # fill in a JWT_SECRET etc.
npx wrangler d1 migrations apply mohini-artistry-db --local
npx wrangler d1 execute mohini-artistry-db --local --file=./seed.sql
npx wrangler dev --port 8787                  # from worker/, in one terminal

cd frontend && npm run dev                    # in a second terminal, runs on :5173
```
