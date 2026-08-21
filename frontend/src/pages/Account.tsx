import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Order } from "@mohini-artistry/shared";
import { getOrderDisplayStatus } from "@mohini-artistry/shared";
import { useAuthStore } from "../store/authStore";
import { ordersApi } from "../api/orders";
import { formatPaise } from "../lib/money";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import LogoutConfirmModal from "../components/layout/LogoutConfirmModal";

export default function Account() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    ordersApi
      .list()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Log in to view your account"
          message="Please log in to see your profile and order history."
          action={
            <Link to="/login" className="rounded-full bg-magenta px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover">
              Log In
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-hairline bg-cream/40 p-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-teal">{user.fullName}</h1>
          <p className="text-sm text-secondary">{user.email}</p>
          {user.phone && <p className="text-sm text-secondary">{user.phone}</p>}
        </div>
        <button
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
          className="rounded-full border border-teal px-4 py-2 text-sm font-semibold text-teal transition-colors hover:bg-teal hover:text-white"
        >
          Log Out
        </button>
      </div>

      {isLogoutConfirmOpen && (
        <LogoutConfirmModal onConfirm={logout} onCancel={() => setIsLogoutConfirmOpen(false)} />
      )}

      <h2 className="mb-4 mt-10 font-display text-xl font-semibold text-teal">Order History</h2>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="Your past orders will show up here."
          action={
            <Link to="/shop" className="text-sm font-semibold text-turquoise underline">
              Start Shopping
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-hairline p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-semibold text-teal">{order.orderNumber}</p>
                  <p className="text-xs text-secondary">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-teal">
                  {getOrderDisplayStatus(order.status, order.paymentStatus)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-secondary">
                  {order.items.length} item{order.items.length === 1 ? "" : "s"} · {formatPaise(order.totalPaise)}
                </p>
                <Link to={`/order/${order.orderNumber}/confirmation`} className="text-sm font-semibold text-turquoise underline">
                  View Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
