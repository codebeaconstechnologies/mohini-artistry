import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Order, OrderStatus } from "@mohini-artistry/shared";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, getOrderDisplayStatus } from "@mohini-artistry/shared";
import { adminApi } from "../../api/admin";
import { formatPaise } from "../../lib/money";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      adminApi.orders
        .list({ status: status || undefined, search: search || undefined, limit: 100 })
        .then((res) => setOrders(res.items))
        .catch(() => setOrders([]))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [status, search]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-teal">Orders</h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatus("")}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            status === "" ? "border-teal bg-teal text-white" : "border-hairline text-secondary"
          }`}
        >
          All
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              status === s ? "border-teal bg-teal text-white" : "border-hairline text-secondary"
            }`}
          >
            {ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search by order number or customer name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none"
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-hairline">
          <table className="min-w-full divide-y divide-hairline text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wide text-secondary">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-mono text-xs text-teal">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-secondary">{order.shippingName}</td>
                  <td className="px-4 py-3 text-teal">{formatPaise(order.totalPaise)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-teal">
                      {getOrderDisplayStatus(order.status, order.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/orders/${order.id}`} className="text-xs font-semibold text-turquoise underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
