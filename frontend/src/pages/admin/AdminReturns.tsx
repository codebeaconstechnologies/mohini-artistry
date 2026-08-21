import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReturnStatusLabel } from "@mohini-artistry/shared";
import { adminApi, type AdminReturnListItem } from "../../api/admin";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";

const STATUS_FILTERS = [
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "customer_shipped", label: "Item Shipped Back" },
  { value: "received", label: "Item Received" },
  { value: "", label: "All" },
];

export default function AdminReturns() {
  const [requests, setRequests] = useState<AdminReturnListItem[]>([]);
  const [status, setStatus] = useState("requested");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    adminApi.returns
      .list({ status: status || undefined })
      .then((res) => setRequests(res.items))
      .catch(() => setRequests([]))
      .finally(() => setIsLoading(false));
  }, [status]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-teal">Refunds &amp; Replacements</h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              status === f.value ? "border-teal bg-teal text-white" : "border-hairline text-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState title="No requests found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-hairline">
          <table className="min-w-full divide-y divide-hairline text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wide text-secondary">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono text-xs text-teal">{r.orderNumber}</td>
                  <td className="px-4 py-3 text-secondary">{r.productName}</td>
                  <td className="px-4 py-3 text-secondary capitalize">{r.type}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-teal">
                      {getReturnStatusLabel(r.type, r.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-secondary">{r.contactEmail}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/orders/${r.orderId}`} className="text-xs font-semibold text-turquoise underline">
                      View Order
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
