import type { Context } from "hono";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function handleError(err: unknown, c: Context) {
  if (err instanceof HttpError) {
    return c.json({ error: err.message, code: err.code }, err.status as any);
  }
  if (err instanceof ZodError) {
    return c.json(
      { error: err.issues[0]?.message ?? "Invalid input", code: "VALIDATION_ERROR" },
      400
    );
  }
  console.error(err);
  return c.json({ error: "Something went wrong. Please try again." }, 500);
}
