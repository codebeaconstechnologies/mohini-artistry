import type { Env } from "../env";
import { nowMs } from "./db";

export interface FreshCartItem {
  productId: number;
  name: string;
  slug: string;
  unitPricePaise: number;
  quantity: number;
  stock: number;
  isActive: boolean;
  imageUrl: string | null;
}

export async function getOrCreateCartId(env: Env, userId: number): Promise<number> {
  const existing = await env.DB.prepare("SELECT id FROM carts WHERE user_id = ?")
    .bind(userId)
    .first<{ id: number }>();
  if (existing) return existing.id;

  const now = nowMs();
  const result = await env.DB.prepare(
    "INSERT INTO carts (user_id, created_at, updated_at) VALUES (?, ?, ?)"
  )
    .bind(userId, now, now)
    .run();
  return result.meta.last_row_id as number;
}

/**
 * Fetches the user's cart items with prices/stock read fresh from `products`
 * right now — this is the only place checkout/cart-preview should ever get
 * a price from. Never trust a client-sent price.
 */
export async function getFreshCartItems(env: Env, userId: number): Promise<FreshCartItem[]> {
  const result = await env.DB.prepare(
    `SELECT
       ci.product_id AS product_id,
       ci.quantity AS quantity,
       p.name AS name,
       p.slug AS slug,
       p.price_paise AS price_paise,
       p.stock AS stock,
       p.is_active AS is_active,
       (SELECT url FROM product_images pi WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS image_url
     FROM cart_items ci
     JOIN carts c ON c.id = ci.cart_id
     JOIN products p ON p.id = ci.product_id
     WHERE c.user_id = ?`
  )
    .bind(userId)
    .all<{
      product_id: number;
      quantity: number;
      name: string;
      slug: string;
      price_paise: number;
      stock: number;
      is_active: number;
      image_url: string | null;
    }>();

  return (result.results ?? []).map((r) => ({
    productId: r.product_id,
    name: r.name,
    slug: r.slug,
    unitPricePaise: r.price_paise,
    quantity: r.quantity,
    stock: r.stock,
    isActive: r.is_active === 1,
    imageUrl: r.image_url,
  }));
}
