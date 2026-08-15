import { useState } from "react";
import { useCartStore } from "../../store/cartStore";

/** Self-contained coupon apply/remove widget driven entirely by cartStore — used in both CartSidebar and the Checkout page. */
export default function CouponInput() {
  const couponCode = useCartStore((s) => s.couponCode);
  const totals = useCartStore((s) => s.totals);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const [input, setInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    const code = input.trim();
    if (!code) return;
    setIsApplying(true);
    setError(null);
    try {
      const res = await applyCoupon(code);
      if (!res.ok) {
        setError(res.reason ?? "That coupon isn't valid for this order.");
      } else {
        setInput("");
      }
    } catch {
      setError("Couldn't validate that coupon right now. Please try again.");
    } finally {
      setIsApplying(false);
    }
  }

  if (couponCode) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm">
        <span className="font-medium text-green-800">
          Coupon <span className="font-mono">{couponCode}</span> applied
          {totals?.discountPaise ? ` — you saved ₹${(totals.discountPaise / 100).toLocaleString("en-IN")}` : ""}
        </span>
        <button type="button" onClick={removeCoupon} className="text-xs font-semibold text-green-700 underline">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="flex-1 rounded-lg border border-hairline px-3 py-2 text-sm uppercase tracking-wide focus:border-magenta focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleApply();
            }
          }}
        />
        <button
          type="button"
          onClick={() => void handleApply()}
          disabled={isApplying || !input.trim()}
          className="rounded-lg border border-teal px-4 py-2 text-sm font-semibold text-teal hover:bg-teal hover:text-white disabled:opacity-40"
        >
          {isApplying ? "Applying…" : "Apply"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
