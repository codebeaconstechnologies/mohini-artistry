import { useState } from "react";
import type { Order, ReturnRequest } from "@mohini-artistry/shared";
import { getReturnStatusLabel } from "@mohini-artistry/shared";
import { adminApi } from "../../api/admin";
import { ApiClientError } from "../../api/client";

export default function ReturnRequestAdminRow({
  request,
  productName,
  onUpdated,
}: {
  request: ReturnRequest;
  productName: string;
  onUpdated: (order: Order) => void;
}) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  async function refreshOrder() {
    const order = await adminApi.orders.get(request.orderId);
    onUpdated(order);
  }

  async function run(action: () => Promise<unknown>) {
    setIsBusy(true);
    setError(null);
    try {
      await action();
      await refreshOrder();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <li className="rounded-xl border border-hairline p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-teal">
            {request.type === "refund" ? "Refund" : "Replacement"} — {productName}
          </p>
          <p className="text-xs text-secondary">{getReturnStatusLabel(request.type, request.status)}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-secondary">Reason: {request.reason}</p>
      {request.returnTrackingNumber && (
        <p className="mt-1 text-xs text-secondary">
          Customer return shipment: {request.returnCourier} — {request.returnTrackingNumber}
        </p>
      )}
      {request.replacementTrackingNumber && (
        <p className="mt-1 text-xs text-secondary">
          Replacement shipment: {request.replacementCourier} — {request.replacementTrackingNumber}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {request.status === "requested" && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void run(() => adminApi.returns.decide(request.id, { action: "approve" }))}
            className="rounded-full bg-teal px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {request.type === "refund" ? "Approve & Refund" : "Approve"}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void run(() => adminApi.returns.decide(request.id, { action: "reject" }))}
            className="rounded-full border border-hairline px-4 py-1.5 text-xs font-semibold text-secondary disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {request.status === "customer_shipped" && (
        <div className="mt-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void run(() => adminApi.returns.receive(request.id))}
            className="rounded-full bg-teal px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Mark Item Received
          </button>
        </div>
      )}

      {request.status === "received" && (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Courier"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="w-32 rounded-lg border border-hairline px-2 py-1.5 text-xs focus:border-magenta focus:outline-none"
            />
            <input
              type="text"
              placeholder="Tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-40 rounded-lg border border-hairline px-2 py-1.5 text-xs focus:border-magenta focus:outline-none"
            />
          </div>
          <button
            type="button"
            disabled={isBusy || !courier.trim() || !trackingNumber.trim()}
            onClick={() =>
              void run(() =>
                adminApi.returns.shipReplacement(request.id, { courier: courier.trim(), trackingNumber: trackingNumber.trim() })
              )
            }
            className="rounded-full bg-teal px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Ship Replacement
          </button>
        </div>
      )}
    </li>
  );
}
