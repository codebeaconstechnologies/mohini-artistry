import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Order } from "@mohini-artistry/shared";
import { getOrderDisplayStatus } from "@mohini-artistry/shared";
import { ordersApi } from "../api/orders";
import { formatPaise } from "../lib/money";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;
    ordersApi
      .get(orderNumber)
      .then(setOrder)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={32} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Order not found"
          message="We couldn't find this order. Check your order history or track it manually."
          action={
            <Link to="/track-order" className="text-sm font-semibold text-turquoise underline">
              Track an Order
            </Link>
          }
        />
      </div>
    );
  }

  const displayStatus = getOrderDisplayStatus(order.status, order.paymentStatus);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✓</div>
      <h1 className="mt-5 font-display text-3xl font-bold text-teal">Thank you for your order!</h1>
      <p className="mt-2 text-secondary">
        Your order <span className="font-mono font-semibold">{order.orderNumber}</span> has been placed.
      </p>
      <p className="mt-1 text-sm text-secondary">Status: {displayStatus}</p>

      <div className="mt-8 rounded-2xl border border-hairline p-6 text-left">
        <h2 className="mb-4 font-display text-lg font-semibold text-teal">Order Summary</h2>
        <ul className="divide-y divide-hairline">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-teal">{item.productName}</p>
                <p className="text-xs text-secondary">
                  Qty {item.quantity} × {formatPaise(item.unitPricePaise)}
                </p>
              </div>
              <span className="text-sm font-semibold text-teal">{formatPaise(item.lineTotalPaise)}</span>
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

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/account" className="rounded-full bg-magenta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover">
          View Order History
        </Link>
        <Link to="/shop" className="rounded-full border border-teal px-6 py-3 text-sm font-semibold text-teal transition-colors hover:bg-teal hover:text-white">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
