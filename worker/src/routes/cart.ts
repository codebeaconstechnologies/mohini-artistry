import { Hono } from "hono";
import {
  addCartItemSchema,
  updateCartItemSchema,
  type Cart,
  type CartItem,
  type CartTotals,
} from "@mohini-artistry/shared";
import type { Env, Variables } from "../env";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { nowMs } from "../lib/db";
import { getOrCreateCartId, getFreshCartItems } from "../lib/cart";
import { validateCoupon, isFirstOrder } from "../lib/coupons";
import { computeCartTotals, type PricingCoupon } from "../lib/pricing";
import { PRODUCT_SELECT_COLUMNS, attachImages, type ProductRow } from "../lib/products";

const cart = new Hono<{ Bindings: Env; Variables: Variables }>();
cart.use("*", requireAuth);

interface CartItemRow extends ProductRow {
  cart_item_id: number;
  quantity: number;
}

cart.get("/", async (c) => {
  const user = c.get("user");
  const cartId = await getOrCreateCartId(c.env, user.id);

  const rows = await c.env.DB.prepare(
    `SELECT ci.id AS cart_item_id, ci.quantity AS quantity, ${PRODUCT_SELECT_COLUMNS}
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     JOIN categories c ON c.id = p.category_id
     WHERE ci.cart_id = ?
     ORDER BY ci.added_at ASC`
  )
    .bind(cartId)
    .all<CartItemRow>();

  const productRows = rows.results ?? [];
  const products = await attachImages(c.env, productRows);

  const items: CartItem[] = productRows.map((row, i) => ({
    id: row.cart_item_id,
    productId: row.id,
    quantity: row.quantity,
    product: products[i]!,
  }));

  return c.json<Cart>({ id: cartId, items });
});

/**
 * Same computation path checkout uses (getFreshCartItems + computeCartTotals),
 * so cart preview and checkout can never disagree on money math.
 */
cart.get("/summary", async (c) => {
  const user = c.get("user");
  const items = await getFreshCartItems(c.env, user.id);
  const firstOrder = await isFirstOrder(c.env, user.id);

  const couponCodeParam = c.req.query("coupon");
  let coupon: PricingCoupon | null = null;
  let couponError: string | null = null;

  if (couponCodeParam) {
    const subtotalPaise = items.reduce((sum, i) => sum + i.unitPricePaise * i.quantity, 0);
    const result = await validateCoupon(c.env, couponCodeParam, user.id, subtotalPaise);
    if (result.ok && result.coupon) {
      coupon = result.coupon;
    } else {
      couponError = result.reason ?? "Invalid coupon.";
    }
  }

  const totals: CartTotals = computeCartTotals({
    items: items.map((i) => ({ unitPricePaise: i.unitPricePaise, quantity: i.quantity })),
    isFirstOrder: firstOrder,
    coupon,
  });

  if (couponError) totals.couponError = couponError;

  return c.json(totals);
});

cart.post("/items", async (c) => {
  const user = c.get("user");
  const body = addCartItemSchema.parse(await c.req.json());

  const product = await c.env.DB.prepare(
    "SELECT id, is_active, stock FROM products WHERE id = ?"
  )
    .bind(body.productId)
    .first<{ id: number; is_active: number; stock: number }>();

  if (!product || product.is_active !== 1) {
    throw new HttpError(404, "Product not found.", "NOT_FOUND");
  }
  if (product.stock <= 0) {
    throw new HttpError(409, "This product is out of stock.", "OUT_OF_STOCK");
  }

  const cartId = await getOrCreateCartId(c.env, user.id);
  const now = nowMs();

  await c.env.DB.prepare(
    `INSERT INTO cart_items (cart_id, product_id, quantity, added_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(cart_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity`
  )
    .bind(cartId, body.productId, body.quantity, now)
    .run();

  // Cap at available stock after the increment (cart_items.quantity has a
  // CHECK(quantity > 0), so this is only safe because stock > 0 was verified above).
  await c.env.DB.prepare(
    "UPDATE cart_items SET quantity = MIN(quantity, ?) WHERE cart_id = ? AND product_id = ?"
  )
    .bind(product.stock, cartId, body.productId)
    .run();

  const row = await c.env.DB.prepare(
    "SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?"
  )
    .bind(cartId, body.productId)
    .first<{ quantity: number }>();

  return c.json({ ok: true, quantity: row?.quantity ?? 0 }, 201);
});

cart.patch("/items/:productId", async (c) => {
  const user = c.get("user");
  const productId = Number(c.req.param("productId"));
  if (!Number.isInteger(productId)) {
    throw new HttpError(400, "Invalid product id.", "VALIDATION_ERROR");
  }

  const body = updateCartItemSchema.parse(await c.req.json());
  const cartId = await getOrCreateCartId(c.env, user.id);

  if (body.quantity === 0) {
    await c.env.DB.prepare("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?")
      .bind(cartId, productId)
      .run();
    return c.json({ ok: true, quantity: 0 });
  }

  const product = await c.env.DB.prepare("SELECT stock FROM products WHERE id = ?")
    .bind(productId)
    .first<{ stock: number }>();
  if (!product) throw new HttpError(404, "Product not found.", "NOT_FOUND");

  const finalQty = Math.min(body.quantity, product.stock);

  const result = await c.env.DB.prepare(
    "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?"
  )
    .bind(finalQty, cartId, productId)
    .run();

  if (result.meta.changes === 0) {
    throw new HttpError(404, "This item is not in your cart.", "NOT_FOUND");
  }

  return c.json({ ok: true, quantity: finalQty });
});

cart.delete("/items/:productId", async (c) => {
  const user = c.get("user");
  const productId = Number(c.req.param("productId"));
  if (!Number.isInteger(productId)) {
    throw new HttpError(400, "Invalid product id.", "VALIDATION_ERROR");
  }

  const cartId = await getOrCreateCartId(c.env, user.id);
  await c.env.DB.prepare("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?")
    .bind(cartId, productId)
    .run();

  return c.json({ ok: true });
});

cart.delete("/", async (c) => {
  const user = c.get("user");
  const cartId = await getOrCreateCartId(c.env, user.id);
  await c.env.DB.prepare("DELETE FROM cart_items WHERE cart_id = ?").bind(cartId).run();
  return c.json({ ok: true });
});

export default cart;
