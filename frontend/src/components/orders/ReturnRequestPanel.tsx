import { useState } from "react";
import type { Order, OrderItem } from "@mohini-artistry/shared";
import { RETURN_ELIGIBILITY_WINDOW_DAYS, RETURN_REQUEST_TERMINAL_STATUSES, getReturnStatusLabel } from "@mohini-artistry/shared";
import { returnsApi } from "../../api/returns";
import { ordersApi } from "../../api/orders";
import { ApiClientError } from "../../api/client";

const WINDOW_MS = RETURN_ELIGIBILITY_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export default function ReturnRequestPanel({
  order,
  item,
  onUpdated,
}: {
  order: Order;
  item: OrderItem;
  onUpdated: (order: Order) => void;
}) {
  const [activeForm, setActiveForm] = useState<"refund" | "replacement" | null>(null);
  const [reason, setReason] = useState("");
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastRequest = [...order.returnRequests].reverse().find((r) => r.orderItemId === item.id);

  const isEligibleWindow = order.status === "delivered" && !!order.deliveredAt && Date.now() - order.deliveredAt <= WINDOW_MS;

  async function refresh() {
    const updated = await ordersApi.get(order.orderNumber);
    onUpdated(updated);
  }

  async function submitRequest(type: "refund" | "replacement") {
    setIsBusy(true);
    setError(null);
    try {
      await returnsApi.create({ orderItemId: item.id, type, reason: reason.trim() });
      setActiveForm(null);
      setReason("");
      await refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not submit the request.");
    } finally {
      setIsBusy(false);
    }
  }

  async function submitShipBack() {
    if (!lastRequest) return;
    setIsBusy(true);
    setError(null);
    try {
      await returnsApi.shipBack(lastRequest.id, { courier: courier.trim(), trackingNumber: trackingNumber.trim() });
      setCourier("");
      setTrackingNumber("");
      await refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not submit the tracking details.");
    } finally {
      setIsBusy(false);
    }
  }

  if (lastRequest && !RETURN_REQUEST_TERMINAL_STATUSES.includes(lastRequest.status)) {
    return (
      <div className="mt-2 rounded-lg bg-cream px-3 py-2 text-xs text-secondary">
        <p className="font-medium text-teal">{getReturnStatusLabel(lastRequest.type, lastRequest.status)}</p>
        {error && <p className="mt-1 text-red-600">{error}</p>}
        {lastRequest.type === "replacement" && lastRequest.status === "approved" && (
          <div className="mt-2 space-y-2">
            <p>Please ship the item back to us and enter the tracking details below.</p>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Courier"
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="w-28 rounded-lg border border-hairline px-2 py-1.5 text-xs focus:border-magenta focus:outline-none"
              />
              <input
                type="text"
                placeholder="Tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-36 rounded-lg border border-hairline px-2 py-1.5 text-xs focus:border-magenta focus:outline-none"
              />
              <button
                type="button"
                disabled={isBusy || !courier.trim() || !trackingNumber.trim()}
                onClick={() => void submitShipBack()}
                className="rounded-full bg-magenta px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                I've Shipped It
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (lastRequest && RETURN_REQUEST_TERMINAL_STATUSES.includes(lastRequest.status)) {
    return (
      <p className="mt-2 text-xs text-secondary">{getReturnStatusLabel(lastRequest.type, lastRequest.status)}</p>
    );
  }

  if (!isEligibleWindow || (!item.isRefundAllowed && !item.isReplaceAllowed)) {
    return null;
  }

  if (activeForm) {
    return (
      <div className="mt-2 space-y-2 rounded-lg border border-hairline p-3">
        <textarea
          placeholder={`Tell us why you'd like a ${activeForm}…`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-hairline px-2 py-1.5 text-xs focus:border-magenta focus:outline-none"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isBusy || reason.trim().length < 5}
            onClick={() => void submitRequest(activeForm)}
            className="rounded-full bg-magenta px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveForm(null);
              setError(null);
            }}
            className="rounded-full border border-hairline px-4 py-1.5 text-xs font-semibold text-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex gap-2">
      {item.isRefundAllowed && (
        <button
          type="button"
          onClick={() => setActiveForm("refund")}
          className="rounded-full border border-turquoise px-3 py-1 text-xs font-semibold text-turquoise"
        >
          Request Refund
        </button>
      )}
      {item.isReplaceAllowed && (
        <button
          type="button"
          onClick={() => setActiveForm("replacement")}
          className="rounded-full border border-turquoise px-3 py-1 text-xs font-semibold text-turquoise"
        >
          Request Replacement
        </button>
      )}
    </div>
  );
}
