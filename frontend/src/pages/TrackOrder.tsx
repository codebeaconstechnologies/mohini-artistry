import { useState, type FormEvent } from "react";
import type { Order } from "@mohini-artistry/shared";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, DRAFT_ORDER_LABEL, getOrderDisplayStatus } from "@mohini-artistry/shared";
import { ordersApi } from "../api/orders";
import { formatPaise } from "../lib/money";
import { ApiClientError } from "../api/client";
import Spinner from "../components/common/Spinner";

const TIMELINE_STAGES = [DRAFT_ORDER_LABEL, ...ORDER_STATUSES.filter((s) => s !== "cancelled").map((s) => ORDER_STATUS_LABELS[s])];

function stageIndex(order: Order): number {
  const display = getOrderDisplayStatus(order.status, order.paymentStatus);
  const idx = TIMELINE_STAGES.indexOf(display);
  return idx === -1 ? 0 : idx;
}

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setIsLoading(true);
    setSearched(true);
    try {
      const result = await ordersApi.track(orderNumber.trim(), email.trim());
      setOrder(result);
    } catch (err) {
      // Deliberately generic — never reveal which of order-id/email was wrong.
      setError(
        err instanceof ApiClientError && err.status === 404
          ? "No order found for that Order ID and email combination."
          : "Something went wrong. Please try again in a moment."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const isCancelled = order?.status === "cancelled";
  const currentStage = order ? stageIndex(order) : -1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-teal">Track Your Order</h1>
      <p className="mt-2 text-sm text-secondary">Enter your Order ID and the email address used at checkout.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-hairline p-6">
        <div>
          <label htmlFor="track-order-number" className="mb-1 block text-sm font-medium text-teal">
            Order ID
          </label>
          <input
            id="track-order-number"
            type="text"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="track-email" className="mb-1 block text-sm font-medium text-teal">
            Email
          </label>
          <input
            id="track-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-magenta py-2.5 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover disabled:opacity-50"
        >
          {isLoading ? "Searching…" : "Track Order"}
        </button>
      </form>

      {isLoading && (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      )}

      {order && !isLoading && (
        <div className="mt-8 rounded-2xl border border-hairline p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-teal">Order {order.orderNumber}</h2>
            <span className="text-sm font-medium text-secondary">{formatPaise(order.totalPaise)}</span>
          </div>

          {isCancelled ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">This order was cancelled.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <ol className="flex min-w-[36rem] items-start">
                {TIMELINE_STAGES.map((stage, i) => (
                  <li key={stage} className="flex flex-1 flex-col items-center text-center">
                    <div className="flex w-full items-center">
                      {i > 0 && <div className={`h-0.5 flex-1 ${i <= currentStage ? "bg-magenta" : "bg-hairline"}`} />}
                      <div
                        className={`mx-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          i <= currentStage ? "bg-magenta text-white" : "bg-hairline text-secondary"
                        }`}
                      >
                        {i + 1}
                      </div>
                      {i < TIMELINE_STAGES.length - 1 && (
                        <div className={`h-0.5 flex-1 ${i < currentStage ? "bg-magenta" : "bg-hairline"}`} />
                      )}
                    </div>
                    <span className={`mt-2 px-1 text-xs ${i <= currentStage ? "font-semibold text-teal" : "text-secondary"}`}>{stage}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-6 border-t border-hairline pt-4">
            <h3 className="mb-2 text-sm font-semibold text-teal">Items</h3>
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
          </div>

          <div className="mt-4 border-t border-hairline pt-4 text-sm text-secondary">
            <p className="font-medium text-teal">Shipping to</p>
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
          </div>
        </div>
      )}

      {searched && !order && !isLoading && !error && <p className="mt-6 text-center text-sm text-secondary">No order found.</p>}
    </div>
  );
}
