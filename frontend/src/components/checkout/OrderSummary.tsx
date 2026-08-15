import type { CartTotals } from "@mohini-artistry/shared";
import { useCartStore } from "../../store/cartStore";
import { formatPaise } from "../../lib/money";

function shippingReasonLabel(reason: string | null | undefined): string {
  if (reason === "threshold") return " (order over ₹1999)";
  if (reason === "first_order") return " (your first order!)";
  if (reason === "coupon") return " (coupon applied)";
  return "";
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${bold ? "text-base font-semibold text-teal" : "text-secondary"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/** Sourced from cartStore.totals (/cart/summary) by default; pass `totals` to override with the create-order response's final totals once checkout has started. */
export default function OrderSummary({ totals: totalsOverride }: { totals?: CartTotals | null }) {
  const storeTotals = useCartStore((s) => s.totals);
  const totals = totalsOverride ?? storeTotals;

  return (
    <div className="space-y-2 rounded-2xl border border-hairline bg-cream/40 p-5">
      <h3 className="font-display text-base font-semibold text-teal">Order Summary</h3>
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
  );
}
