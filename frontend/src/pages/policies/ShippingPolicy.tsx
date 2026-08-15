import { formatPaise } from "../../lib/money";
import { FREE_SHIPPING_THRESHOLD_PAISE, FIRST_ORDER_FREE_SHIPPING_THRESHOLD_PAISE, STANDARD_SHIPPING_FEE_PAISE } from "@mohini-artistry/shared";

// Placeholder policy content, appropriate for a small India-based handmade
// goods business — not legal advice. Refine before launch.
export default function ShippingPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-teal">Shipping Policy</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-secondary">
        <p>
          Mohini Artistry ships handcrafted rangolis, resin art and fabric canvas pieces across India. Because each
          piece is handmade or hand-packed, please allow a little extra care and time compared to mass-produced
          goods.
        </p>

        <section>
          <h2 className="font-display text-lg font-semibold text-teal">Shipping Charges</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Orders over {formatPaise(FREE_SHIPPING_THRESHOLD_PAISE)} ship free, always.</li>
            <li>
              First-time customers get free shipping on orders over {formatPaise(FIRST_ORDER_FREE_SHIPPING_THRESHOLD_PAISE)}.
            </li>
            <li>All other orders are charged a flat shipping fee of {formatPaise(STANDARD_SHIPPING_FEE_PAISE)}.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-teal">Processing & Delivery Times</h2>
          <p className="mt-2">
            Orders are typically prepared and handed to our courier partner within 2–5 business days of payment
            being confirmed, and delivered within 3–9 business days thereafter depending on your location. You'll
            see each stage — placed, prepared, shipped and delivered — on the Track Order page using your Order ID
            and email.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-teal">Fragile Items</h2>
          <p className="mt-2">
            Resin pieces and framed canvases are cushioned and boxed with extra care. If your order arrives damaged,
            please contact us within 48 hours of delivery with photos so we can help promptly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-teal">Delays</h2>
          <p className="mt-2">
            During festival seasons, courier volumes rise across the country and deliveries may take a little longer
            than usual. We appreciate your patience and will keep your order status updated throughout.
          </p>
        </section>
      </div>
    </div>
  );
}
