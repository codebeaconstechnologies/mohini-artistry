import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ShippingAddressInput, CartTotals } from "@mohini-artistry/shared";
import { checkoutApi } from "../../api/checkout";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { ApiClientError } from "../../api/client";
import { RAZORPAY_CHECKOUT_SCRIPT_SRC } from "../../lib/constants";

let scriptLoadPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the Razorpay checkout script."));
    document.body.appendChild(script);
  });
  return scriptLoadPromise;
}

interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export default function RazorpayButton({
  shippingAddress,
  couponCode,
  disabled,
  onOrderTotalsChange,
  onBeforePay,
}: {
  shippingAddress: ShippingAddressInput;
  couponCode?: string;
  disabled?: boolean;
  onOrderTotalsChange?: (totals: CartTotals) => void;
  /** Return false to abort before calling the API (e.g. client-side address validation failed). */
  onBeforePay?: () => boolean;
}) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearCart = useCartStore((s) => s.clearCart);
  const pushToast = useUiStore((s) => s.pushToast);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    if (onBeforePay && !onBeforePay()) {
      setError("Please fix the highlighted fields in your shipping address.");
      return;
    }
    setIsProcessing(true);
    try {
      // 1. Ask the worker to create the order + a matching Razorpay order.
      const order = await checkoutApi.createOrder({ shippingAddress, couponCode });
      onOrderTotalsChange?.(order.totals);

      // 2. Load the Razorpay Checkout.js script (once) and open the modal.
      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: "Mohini Artistry",
        description: `Order ${order.orderNumber}`,
        prefill: order.prefill,
        theme: { color: "#C2185B" },
        handler: async (response: RazorpayHandlerResponse) => {
          try {
            // 3. On the payment success callback, verify server-side, then land on the confirmation page.
            await checkoutApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            await clearCart();
            navigate(`/order/${order.orderNumber}/confirmation`);
          } catch (err) {
            pushToast(
              err instanceof ApiClientError
                ? err.message
                : "Payment verification failed. Please contact us if you were charged.",
              "error"
            );
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not start checkout. Please try again.");
      setIsProcessing(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={() => void handlePay()}
        disabled={disabled || isProcessing || !user}
        className="w-full rounded-full border border-gold/50 bg-teal py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-hover disabled:opacity-50"
      >
        {isProcessing ? "Opening secure payment…" : "Pay Securely with Razorpay"}
      </button>
    </div>
  );
}
