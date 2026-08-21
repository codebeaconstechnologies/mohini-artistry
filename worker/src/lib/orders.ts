import type { Env } from "../env";
import type { Order, OrderItem, OrderStatusHistoryEntry, ReturnRequest } from "@mohini-artistry/shared";

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
  delivered_at: number | null;
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
  is_refund_allowed: number;
  is_replace_allowed: number;
}

interface HistoryRow {
  status: string;
  note: string | null;
  created_at: number;
}

interface ReturnRequestRow {
  id: number;
  order_id: number;
  order_item_id: number;
  user_id: number;
  type: string;
  status: string;
  reason: string;
  admin_note: string | null;
  return_courier: string | null;
  return_tracking_number: string | null;
  replacement_courier: string | null;
  replacement_tracking_number: string | null;
  refund_amount_paise: number | null;
  created_at: number;
  updated_at: number;
}

const ORDER_COLUMNS = `
  id, order_number, status, subtotal_paise, shipping_paise, discount_paise, total_paise,
  coupon_code, shipping_name, shipping_phone, shipping_address1, shipping_address2,
  shipping_state, shipping_city, shipping_pincode, contact_email, payment_status,
  created_at, updated_at, delivered_at
`;

function rowToReturnRequest(row: ReturnRequestRow): ReturnRequest {
  return {
    id: row.id,
    orderId: row.order_id,
    orderItemId: row.order_item_id,
    userId: row.user_id,
    type: row.type as ReturnRequest["type"],
    status: row.status as ReturnRequest["status"],
    reason: row.reason,
    adminNote: row.admin_note,
    returnCourier: row.return_courier,
    returnTrackingNumber: row.return_tracking_number,
    replacementCourier: row.replacement_courier,
    replacementTrackingNumber: row.replacement_tracking_number,
    refundAmountPaise: row.refund_amount_paise,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToOrder(
  row: OrderRow,
  items: OrderItem[],
  history: OrderStatusHistoryEntry[],
  returnRequests: ReturnRequest[]
): Order {
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
    deliveredAt: row.delivered_at,
    items,
    statusHistory: history,
    returnRequests,
  };
}

async function fetchItemsAndHistory(
  env: Env,
  orderIds: number[]
): Promise<{
  itemsByOrder: Map<number, OrderItem[]>;
  historyByOrder: Map<number, OrderStatusHistoryEntry[]>;
  returnRequestsByOrder: Map<number, ReturnRequest[]>;
}> {
  const itemsByOrder = new Map<number, OrderItem[]>();
  const historyByOrder = new Map<number, OrderStatusHistoryEntry[]>();
  const returnRequestsByOrder = new Map<number, ReturnRequest[]>();
  if (orderIds.length === 0) return { itemsByOrder, historyByOrder, returnRequestsByOrder };

  const placeholders = orderIds.map(() => "?").join(",");

  const itemsResult = await env.DB.prepare(
    `SELECT oi.id, oi.order_id, oi.product_id, oi.product_name, oi.unit_price_paise, oi.quantity, oi.line_total_paise,
            oi.is_refund_allowed, oi.is_replace_allowed,
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
      isRefundAllowed: row.is_refund_allowed === 1,
      isReplaceAllowed: row.is_replace_allowed === 1,
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

  const returnsResult = await env.DB.prepare(
    `SELECT id, order_id, order_item_id, user_id, type, status, reason, admin_note,
            return_courier, return_tracking_number, replacement_courier, replacement_tracking_number,
            refund_amount_paise, created_at, updated_at
     FROM return_requests WHERE order_id IN (${placeholders}) ORDER BY created_at ASC`
  )
    .bind(...orderIds)
    .all<ReturnRequestRow>();

  for (const row of returnsResult.results ?? []) {
    const list = returnRequestsByOrder.get(row.order_id) ?? [];
    list.push(rowToReturnRequest(row));
    returnRequestsByOrder.set(row.order_id, list);
  }

  return { itemsByOrder, historyByOrder, returnRequestsByOrder };
}

export async function getOrdersForUser(env: Env, userId: number): Promise<Order[]> {
  const result = await env.DB.prepare(
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`
  )
    .bind(userId)
    .all<OrderRow>();

  const rows = result.results ?? [];
  const { itemsByOrder, historyByOrder, returnRequestsByOrder } = await fetchItemsAndHistory(env, rows.map((r) => r.id));
  return rows.map((row) =>
    rowToOrder(row, itemsByOrder.get(row.id) ?? [], historyByOrder.get(row.id) ?? [], returnRequestsByOrder.get(row.id) ?? [])
  );
}

export async function getOrderByNumber(env: Env, orderNumber: string): Promise<Order | null> {
  const row = await env.DB.prepare(`SELECT ${ORDER_COLUMNS} FROM orders WHERE order_number = ?`)
    .bind(orderNumber)
    .first<OrderRow>();
  if (!row) return null;

  const { itemsByOrder, historyByOrder, returnRequestsByOrder } = await fetchItemsAndHistory(env, [row.id]);
  return rowToOrder(row, itemsByOrder.get(row.id) ?? [], historyByOrder.get(row.id) ?? [], returnRequestsByOrder.get(row.id) ?? []);
}

export async function getOrderById(env: Env, id: number): Promise<Order | null> {
  const row = await env.DB.prepare(`SELECT ${ORDER_COLUMNS} FROM orders WHERE id = ?`)
    .bind(id)
    .first<OrderRow>();
  if (!row) return null;

  const { itemsByOrder, historyByOrder, returnRequestsByOrder } = await fetchItemsAndHistory(env, [row.id]);
  return rowToOrder(row, itemsByOrder.get(row.id) ?? [], historyByOrder.get(row.id) ?? [], returnRequestsByOrder.get(row.id) ?? []);
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
  const { itemsByOrder, historyByOrder, returnRequestsByOrder } = await fetchItemsAndHistory(env, rows.map((r) => r.id));
  const items = rows.map((row) =>
    rowToOrder(row, itemsByOrder.get(row.id) ?? [], historyByOrder.get(row.id) ?? [], returnRequestsByOrder.get(row.id) ?? [])
  );

  return { items, total: countRow?.count ?? 0 };
}
