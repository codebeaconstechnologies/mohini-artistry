import type { Env } from "../env";
import type { Order, OrderItem, OrderStatusHistoryEntry } from "@mohini-artistry/shared";

interface OrderRow {
  id: number;
  order_number: string;
  status: string;
  subtotal_paise: number;
  shipping_paise: number;
  discount_paise: number;
  total_paise: number;
  coupon_code: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address1: string;
  shipping_address2: string | null;
  shipping_state: string;
  shipping_city: string;
  shipping_pincode: string;
  contact_email: string;
  payment_status: string;
  created_at: number;
  updated_at: number;
}

interface OrderItemRow {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price_paise: number;
  quantity: number;
  line_total_paise: number;
  slug?: string;
  image_url?: string | null;
}

interface HistoryRow {
  status: string;
  note: string | null;
  created_at: number;
}

const ORDER_COLUMNS = `
  id, order_number, status, subtotal_paise, shipping_paise, discount_paise, total_paise,
  coupon_code, shipping_name, shipping_phone, shipping_address1, shipping_address2,
  shipping_state, shipping_city, shipping_pincode, contact_email, payment_status,
  created_at, updated_at
`;

function rowToOrder(row: OrderRow, items: OrderItem[], history: OrderStatusHistoryEntry[]): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status as Order["status"],
    subtotalPaise: row.subtotal_paise,
    shippingPaise: row.shipping_paise,
    discountPaise: row.discount_paise,
    totalPaise: row.total_paise,
    couponCode: row.coupon_code,
    shippingName: row.shipping_name,
    shippingPhone: row.shipping_phone,
    shippingAddress1: row.shipping_address1,
    shippingAddress2: row.shipping_address2,
    shippingState: row.shipping_state,
    shippingCity: row.shipping_city,
    shippingPincode: row.shipping_pincode,
    contactEmail: row.contact_email,
    paymentStatus: row.payment_status as Order["paymentStatus"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
    statusHistory: history,
  };
}

async function fetchItemsAndHistory(
  env: Env,
  orderIds: number[]
): Promise<{ itemsByOrder: Map<number, OrderItem[]>; historyByOrder: Map<number, OrderStatusHistoryEntry[]> }> {
  const itemsByOrder = new Map<number, OrderItem[]>();
  const historyByOrder = new Map<number, OrderStatusHistoryEntry[]>();
  if (orderIds.length === 0) return { itemsByOrder, historyByOrder };

  const placeholders = orderIds.map(() => "?").join(",");

  const itemsResult = await env.DB.prepare(
    `SELECT oi.id, oi.order_id, oi.product_id, oi.product_name, oi.unit_price_paise, oi.quantity, oi.line_total_paise,
            p.slug AS slug,
            (SELECT url FROM product_images pi WHERE pi.product_id = oi.product_id
               ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS image_url
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id IN (${placeholders})`
  )
    .bind(...orderIds)
    .all<OrderItemRow>();

  for (const row of itemsResult.results ?? []) {
    const list = itemsByOrder.get(row.order_id) ?? [];
    list.push({
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
      productSlug: row.slug,
      unitPricePaise: row.unit_price_paise,
      quantity: row.quantity,
      lineTotalPaise: row.line_total_paise,
      imageUrl: row.image_url ?? null,
    });
    itemsByOrder.set(row.order_id, list);
  }

  const historyResult = await env.DB.prepare(
    `SELECT order_id, status, note, created_at FROM order_status_history
     WHERE order_id IN (${placeholders}) ORDER BY created_at ASC`
  )
    .bind(...orderIds)
    .all<HistoryRow & { order_id: number }>();

  for (const row of historyResult.results ?? []) {
    const list = historyByOrder.get(row.order_id) ?? [];
    list.push({ status: row.status as Order["status"], note: row.note, createdAt: row.created_at });
    historyByOrder.set(row.order_id, list);
  }

  return { itemsByOrder, historyByOrder };
}

export async function getOrdersForUser(env: Env, userId: number): Promise<Order[]> {
  const result = await env.DB.prepare(
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`
  )
    .bind(userId)
    .all<OrderRow>();

  const rows = result.results ?? [];
  const { itemsByOrder, historyByOrder } = await fetchItemsAndHistory(env, rows.map((r) => r.id));
  return rows.map((row) => rowToOrder(row, itemsByOrder.get(row.id) ?? [], historyByOrder.get(row.id) ?? []));
}

export async function getOrderByNumber(env: Env, orderNumber: string): Promise<Order | null> {
  const row = await env.DB.prepare(`SELECT ${ORDER_COLUMNS} FROM orders WHERE order_number = ?`)
    .bind(orderNumber)
    .first<OrderRow>();
  if (!row) return null;

  const { itemsByOrder, historyByOrder } = await fetchItemsAndHistory(env, [row.id]);
  return rowToOrder(row, itemsByOrder.get(row.id) ?? [], historyByOrder.get(row.id) ?? []);
}

export async function getOrderById(env: Env, id: number): Promise<Order | null> {
  const row = await env.DB.prepare(`SELECT ${ORDER_COLUMNS} FROM orders WHERE id = ?`)
    .bind(id)
    .first<OrderRow>();
  if (!row) return null;

  const { itemsByOrder, historyByOrder } = await fetchItemsAndHistory(env, [row.id]);
  return rowToOrder(row, itemsByOrder.get(row.id) ?? [], historyByOrder.get(row.id) ?? []);
}

export interface AdminOrdersQuery {
  status?: string;
  search?: string;
  page: number;
  limit: number;
}

/** Admin order search/list — filters by status and/or order_number/contact_email match. */
export async function getAllOrdersAdmin(
  env: Env,
  opts: AdminOrdersQuery
): Promise<{ items: Order[]; total: number }> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (opts.status) {
    conditions.push("status = ?");
    params.push(opts.status);
  }
  if (opts.search) {
    conditions.push("(order_number LIKE ? OR contact_email LIKE ?)");
    params.push(`%${opts.search}%`, `%${opts.search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (opts.page - 1) * opts.limit;

  const countRow = await env.DB.prepare(`SELECT COUNT(*) AS count FROM orders ${whereClause}`)
    .bind(...params)
    .first<{ count: number }>();

  const result = await env.DB.prepare(
    `SELECT ${ORDER_COLUMNS} FROM orders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  )
    .bind(...params, opts.limit, offset)
    .all<OrderRow>();

  const rows = result.results ?? [];
  const { itemsByOrder, historyByOrder } = await fetchItemsAndHistory(env, rows.map((r) => r.id));
  const items = rows.map((row) =>
    rowToOrder(row, itemsByOrder.get(row.id) ?? [], historyByOrder.get(row.id) ?? [])
  );

  return { items, total: countRow?.count ?? 0 };
}
