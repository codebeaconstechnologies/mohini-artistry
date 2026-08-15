import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ShippingAddressInput, CartTotals } from "@mohini-artistry/shared";
import { shippingAddressSchema, DEFAULT_STATE } from "@mohini-artistry/shared";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import AddressForm from "../components/checkout/AddressForm";
import OrderSummary from "../components/checkout/OrderSummary";
import CouponInput from "../components/checkout/CouponInput";
import RazorpayButton from "../components/checkout/RazorpayButton";
import EmptyState from "../components/common/EmptyState";
import Spinner from "../components/common/Spinner";

const emptyAddress: ShippingAddressInput = {
  fullName: "",
  phone: "",
  address1: "",
  address2: "",
  state: DEFAULT_STATE,
  city: "",
  pincode: "",
};

export default function Checkout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const cart = useCartStore((s) => s.cart);
  const isLoading = useCartStore((s) => s.isLoading);
  const couponCode = useCartStore((s) => s.couponCode);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [address, setAddress] = useState<ShippingAddressInput>(emptyAddress);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddressInput, string>>>({});
  const [finalTotals, setFinalTotals] = useState<CartTotals | null>(null);

  useEffect(() => {
    if (isAuthenticated) void fetchCart();
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    if (!user) return;
    setAddress((prev) => ({
      ...prev,
      fullName: prev.fullName || user.fullName,
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  function validate(): boolean {
    const parsed = shippingAddressSchema.safeParse(address);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: Partial<Record<keyof ShippingAddressInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ShippingAddressInput;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    setErrors(fieldErrors);
    return false;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Log in to check out"
          message="Please log in or create an account to complete your order."
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
          message="Add something to your cart before checking out."
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display text-3xl font-bold text-teal">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-semibold text-teal">Shipping Address</h2>
          <AddressForm value={address} onChange={setAddress} errors={errors} />
        </div>

        <div className="space-y-4">
          <CouponInput />
          <OrderSummary totals={finalTotals} />
          <RazorpayButton shippingAddress={address} couponCode={couponCode ?? undefined} onOrderTotalsChange={setFinalTotals} onBeforePay={validate} />
          <p className="text-center text-xs text-secondary">Payments are processed securely by Razorpay. We never store your card details.</p>
        </div>
      </div>
    </div>
  );
}
