import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { OrderStatus } from "@mohini-artistry/shared";
import { ORDER_STATUS_LABELS } from "@mohini-artistry/shared";
import { adminApi } from "../../api/admin";
import Spinner from "../../components/common/Spinner";

export default function AdminDashboard() {
  const [statusCounts, setStatusCounts] = useState<Partial<Record<OrderStatus, number>>>({});
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi.orders
      .list({ limit: 100 })
      .then((res) => {
        setTotal(res.total);
        const tally: Partial<Record<OrderStatus, number>> = {};
        for (const order of res.items) {
          tally[order.status] = (tally[order.status] ?? 0) + 1;
        }
        setStatusCounts(tally);
      })
      .catch(() => setStatusCounts({}))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-teal">Dashboard</h1>
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-hairline p-5">
            <p className="text-xs uppercase tracking-wide text-secondary">Total Orders</p>
            <p className="mt-1 text-3xl font-bold text-teal">{total}</p>
          </div>
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((status) => (
            <div key={status} className="rounded-2xl border border-hairline p-5">
              <p className="text-xs uppercase tracking-wide text-secondary">{ORDER_STATUS_LABELS[status]} (recent)</p>
              <p className="mt-1 text-3xl font-bold text-teal">{statusCounts[status] ?? 0}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/products" className="rounded-full bg-teal px-5 py-2 text-sm font-semibold text-white">
          Manage Products
        </Link>
        <Link to="/admin/orders" className="rounded-full border border-teal px-5 py-2 text-sm font-semibold text-teal">
          Manage Orders
        </Link>
      </div>
    </div>
  );
}
