import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Order, OrderStatus } from "@mohini-artistry/shared";
import { ORDER_STATUS_TRANSITIONS, ORDER_STATUS_LABELS, getOrderDisplayStatus } from "@mohini-artistry/shared";
import { adminApi } from "../../api/admin";
import { formatPaise } from "../../lib/money";
import { ApiClientError } from "../../api/client";
import Spinner from "../../components/common/Spinner";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    adminApi.orders
      .get(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleAdvance(nextStatus: OrderStatus) {
    if (!order) return;
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await adminApi.orders.updateStatus(order.id, { status: nextStatus });
      setOrder(updated);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not update order status.");
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }
  if (!order) return <p className="text-sm text-secondary">Order not found.</p>;

  const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
  const canAdvance = order.paymentStatus === "verified";

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-teal">{order.orderNumber}</h1>
          <p className="text-sm text-secondary">{getOrderDisplayStatus(order.status, order.paymentStatus)}</p>
        </div>
        {canAdvance && allowedTransitions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allowedTransitions.map((status) => (
              <button
                key={status}
                type="button"
                disabled={isUpdating}
                onClick={() => void handleAdvance(status)}
                className="rounded-full bg-teal px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                Mark as {ORDER_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        )}
      </div>

      {!canAdvance && (
        <p className="mb-4 rounded-lg bg-cream px-3 py-2 text-xs text-secondary">
          Payment has not been verified yet, so this order's status cannot be advanced.
        </p>
      )}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-hairline p-5">
        <h2 className="mb-3 text-sm font-semibold text-teal">Items</h2>
        <ul className="space-y-2 text-sm text-secondary">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>{formatPaise(item.lineTotalPaise)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-hairline pt-4 text-sm">
          <div className="flex justify-between text-secondary">
            <span>Subtotal</span>
            <span>{formatPaise(order.subtotalPaise)}</span>
          </div>
          <div className="flex justify-between text-secondary">
            <span>Shipping</span>
            <span>{order.shippingPaise === 0 ? "FREE" : formatPaise(order.shippingPaise)}</span>
          </div>
          {order.discountPaise > 0 && (
            <div className="flex justify-between text-secondary">
              <span>Discount</span>
              <span>− {formatPaise(order.discountPaise)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold text-teal">
            <span>Total</span>
            <span>{formatPaise(order.totalPaise)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-hairline p-5 text-sm text-secondary">
        <h2 className="mb-2 font-semibold text-teal">Shipping Address</h2>
        <p>
          {order.shippingName}, {order.shippingPhone}
        </p>
        <p>
          {order.shippingAddress1}
          {order.shippingAddress2 ? `, ${order.shippingAddress2}` : ""}
        </p>
        <p>
          {order.shippingCity}, {order.shippingState} — {order.shippingPincode}
        </p>
        <p className="mt-1 text-secondary">{order.contactEmail}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-hairline p-5">
        <h2 className="mb-2 text-sm font-semibold text-teal">Status History</h2>
        <ul className="space-y-1 text-xs text-secondary">
          {order.statusHistory.map((entry, i) => (
            <li key={i}>
              {new Date(entry.createdAt).toLocaleString("en-IN")} — {ORDER_STATUS_LABELS[entry.status]}
              {entry.note ? ` (${entry.note})` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
