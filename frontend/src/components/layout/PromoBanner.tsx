import { useState } from "react";
import { formatPaise } from "../../lib/money";
import { FREE_SHIPPING_THRESHOLD_PAISE, FIRST_ORDER_FREE_SHIPPING_THRESHOLD_PAISE } from "@mohini-artistry/shared";
import { CloseIcon } from "../common/icons";

// There is no "list active public coupons" endpoint yet, so this banner
// shows the two standing shipping rules from shared/src/constants/shipping.ts
// as static copy. If/when a public coupons endpoint exists, swap the
// hard-coded message below for one built from that response.
export default function PromoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="relative px-4 py-2 text-center text-xs font-medium text-white sm:text-sm"
      style={{ background: "linear-gradient(135deg, #C2185B, #F08A24)" }}
    >
      <span>
        🎉 Free shipping on orders over {formatPaise(FREE_SHIPPING_THRESHOLD_PAISE)} — new customers get free
        shipping over {formatPaise(FIRST_ORDER_FREE_SHIPPING_THRESHOLD_PAISE)} on their first order!
      </span>
      <button
        type="button"
        aria-label="Dismiss banner"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/90 hover:bg-white/10"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
