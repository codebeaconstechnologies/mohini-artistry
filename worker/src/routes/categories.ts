import { Hono } from "hono";
import type { Category } from "@mohini-artistry/shared";
import type { Env, Variables } from "../env";

const categories = new Hono<{ Bindings: Env; Variables: Variables }>();

interface CategoryRow {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}

categories.get("/", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT id, slug, name, description, sort_order FROM categories ORDER BY sort_order ASC"
  ).all<CategoryRow>();

  const items: Category[] = (result.results ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  }));

  return c.json(items);
});

export default categories;
