import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useCheckoutGate } from "../../hooks/useCheckoutGate";
import { formatPaise } from "../../lib/money";
import { CloseIcon, PlusIcon, MinusIcon, TrashIcon } from "../common/icons";
import Spinner from "../common/Spinner";
import EmptyState from "../common/EmptyState";
import CouponInput from "../checkout/CouponInput";

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

function CartLine({
  imageUrl,
  name,
  pricePaise,
  quantity,
  stock,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  imageUrl?: string;
  name: string;
  pricePaise: number;
  quantity: number;
  stock: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex gap-3">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream">
        {imageUrl && <img src={imageUrl} alt={name} className="h-full w-full object-cover" />}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-medium text-teal">{name}</p>
          <button type="button" onClick={onRemove} aria-label="Remove item" className="shrink-0 text-secondary hover:text-secondary">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-hairline">
            <button type="button" onClick={onDecrease} className="p-1.5 text-secondary hover:text-turquoise" aria-label="Decrease quantity">
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[1.2rem] text-center text-sm">{quantity}</span>
            <button
              type="button"
              onClick={onIncrease}
              disabled={quantity >= stock}
              className="p-1.5 text-secondary hover:text-turquoise disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-sm font-semibold text-teal">{formatPaise(pricePaise * quantity)}</span>
        </div>
      </div>
    </li>
  );
}

export default function CartSidebar() {
  const isOpen = useUiStore((s) => s.isCartOpen);
  const closeCart = useUiStore((s) => s.closeCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cart = useCartStore((s) => s.cart);
  const totals = useCartStore((s) => s.totals);
  const isLoading = useCartStore((s) => s.isLoading);
  const pendingItems = useCartStore((s) => s.pendingItems);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const goToCheckout = useCheckoutGate();

  useEffect(() => {
    if (isOpen && isAuthenticated) void fetchCart();
  }, [isOpen, isAuthenticated, fetchCart]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const items = cart?.items ?? [];
  const isEmpty = isAuthenticated ? items.length === 0 : pendingItems.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} aria-hidden="true" />
      <div className="relative flex h-full w-full max-w-md flex-col bg-softwhite shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-teal">Your Cart</h2>
          <button type="button" onClick={closeCart} aria-label="Close cart" className="rounded-full p-1.5 hover:bg-cream">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!isAuthenticated && pendingItems.length > 0 && (
            <p className="mb-3 rounded-lg bg-cream px-3 py-2 text-xs text-secondary">
              You have {pendingItems.length} item(s) saved locally. Log in to sync your cart and check out.
            </p>
          )}

          {isLoading && isAuthenticated ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : isEmpty ? (
            <EmptyState title="Your cart is empty" message="Browse our collections and add something you love." />
          ) : isAuthenticated ? (
            <ul className="space-y-4">
              {items.map((item) => (
                <CartLine
                  key={item.id}
                  imageUrl={item.product.images[0]?.url}
                  name={item.product.name}
                  pricePaise={item.product.pricePaise}
                  quantity={item.quantity}
                  stock={item.product.stock}
                  onIncrease={() => void updateItem(item.productId, item.quantity + 1)}
                  onDecrease={() => void updateItem(item.productId, item.quantity - 1)}
                  onRemove={() => void removeItem(item.productId)}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-secondary">
              Your saved items will sync once you log in —{" "}
              <Link to="/login" className="font-semibold underline" onClick={closeCart}>
                log in now
              </Link>
              .
            </p>
          )}
        </div>

        {isAuthenticated && !isEmpty && (
          <div className="space-y-3 border-t border-hairline px-5 py-4">
            <CouponInput />
            <div className="space-y-1 text-sm">
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
              onClick={() => {
                closeCart();
                goToCheckout();
              }}
              className="w-full rounded-full bg-magenta py-3 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
