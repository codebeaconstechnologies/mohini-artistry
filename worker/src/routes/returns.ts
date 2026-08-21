import { Hono } from "hono";
import { createReturnRequestSchema, shipTrackingSchema } from "@mohini-artistry/shared";
import type { Env, Variables } from "../env";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { createReturnRequest, getReturnRequestById, markReplacementCustomerShipped } from "../lib/returns";

const returns = new Hono<{ Bindings: Env; Variables: Variables }>();
returns.use("*", requireAuth);

returns.post("/", async (c) => {
  const user = c.get("user");
  const body = createReturnRequestSchema.parse(await c.req.json());
  const created = await createReturnRequest(c.env, user.id, body as { orderItemId: number; type: "refund" | "replacement"; reason: string });
  return c.json(created, 201);
});

returns.post("/:id/ship", async (c) => {
  const user = c.get("user");
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid request id.", "VALIDATION_ERROR");

  const body = shipTrackingSchema.parse(await c.req.json());
  const request = await getReturnRequestById(c.env, id);
  if (!request || request.userId !== user.id) {
    throw new HttpError(404, "Request not found.", "NOT_FOUND");
  }
  if (request.type !== "replacement" || request.status !== "approved") {
    throw new HttpError(409, "This request is not awaiting a return shipment.", "INVALID_STATE");
  }

  await markReplacementCustomerShipped(c.env, id, body.courier, body.trackingNumber);
  const updated = await getReturnRequestById(c.env, id);
  return c.json(updated);
});

export default returns;
