import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useCheckoutGate } from "../hooks/useCheckoutGate";
import { formatPaise } from "../lib/money";
import EmptyState from "../components/common/EmptyState";
import Spinner from "../components/common/Spinner";
import CouponInput from "../components/checkout/CouponInput";
import { PlusIcon, MinusIcon, TrashIcon } from "../components/common/icons";

function shippingReasonLabel(reason: string | null | undefined): string {
  if (reason === "threshold") return " (order over ₹1999)";
  if (reason === "first_order") return " (your first order!)";
  if (reason === "coupon") return " (coupon applied)";
  return "";
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-semibold text-teal" : "text-secondary"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function Cart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cart = useCartStore((s) => s.cart);
  const totals = useCartStore((s) => s.totals);
  const isLoading = useCartStore((s) => s.isLoading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const goToCheckout = useCheckoutGate();

  useEffect(() => {
    if (isAuthenticated) void fetchCart();
  }, [isAuthenticated, fetchCart]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Log in to view your cart"
          message="Your cart syncs to your account once you're logged in."
          action={
            <Link to="/login" className="rounded-full bg-magenta px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover">
              Log In
            </Link>
          }
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={32} />
      </div>
    );
  }

  const items = cart?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Your cart is empty"
          message="Browse our collections and add something you love."
          action={
            <Link to="/shop" className="rounded-full bg-magenta px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover">
              Continue Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display text-3xl font-bold text-teal">Your Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <ul className="space-y-5 lg:col-span-2">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 rounded-2xl border border-hairline p-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream">
                {item.product.images[0] && (
                  <img src={item.product.images[0].url} alt={item.product.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/product/${item.product.slug}`} className="text-sm font-semibold text-teal hover:text-turquoise">
                      {item.product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-secondary">{formatPaise(item.product.pricePaise)} each</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeItem(item.productId)}
                    aria-label="Remove item"
                    className="shrink-0 text-secondary hover:text-secondary"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-hairline">
                    <button
                      type="button"
                      onClick={() => void updateItem(item.productId, item.quantity - 1)}
                      className="p-1.5 text-secondary hover:text-turquoise"
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => void updateItem(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="p-1.5 text-secondary hover:text-turquoise disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-teal">{formatPaise(item.product.pricePaise * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-4">
          <CouponInput />
          <div className="space-y-2 rounded-2xl border border-hairline bg-cream/40 p-5 text-sm">
            <Row label="Subtotal" value={totals ? formatPaise(totals.subtotalPaise) : "—"} />
            <Row
              label="Shipping"
              value={
                totals
                  ? totals.shippingPaise === 0
                    ? `FREE${shippingReasonLabel(totals.freeShippingReason)}`
                    : formatPaise(totals.shippingPaise)
                  : "—"
              }
            />
            {totals && totals.discountPaise > 0 && <Row label="Discount" value={`− ${formatPaise(totals.discountPaise)}`} />}
            <div className="my-2 h-px bg-hairline" />
            <Row label="Total" value={totals ? formatPaise(totals.totalPaise) : "—"} bold />
          </div>
          <button
            type="button"
            onClick={goToCheckout}
            className="w-full rounded-full bg-magenta py-3 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
