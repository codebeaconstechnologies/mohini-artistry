// Placeholder policy content, appropriate for a small India-based handmade
// goods business — not legal advice. Refine before launch.
export default function RefundPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-teal">Refund &amp; Cancellation Policy</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-secondary">
        <p>
          Because most pieces on Mohini Artistry are made or finished to order, we handle cancellations and refunds a
          little differently from mass-market retail. Please read the details below before placing an order.
        </p>

        <section>
          <h2 className="font-display text-lg font-semibold text-teal">Cancellations</h2>
          <p className="mt-2">
            You may cancel an order for a full refund any time before it enters the "Prepared" stage. Once an order
            has been marked prepared or shipped, it can no longer be cancelled, since packing has already begun.
            To request a cancellation, contact us with your Order ID as soon as possible.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-teal">Damaged or Incorrect Items</h2>
          <p className="mt-2">
            If your order arrives damaged, defective, or different from what you ordered, contact us within 48 hours
            of delivery with clear photos of the item and packaging. We'll arrange a replacement or a full refund,
            whichever you prefer.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-teal">Change of Mind</h2>
          <p className="mt-2">
            As many of our pieces are handmade in small batches, we're currently unable to accept change-of-mind
            returns once an order has shipped. We encourage you to check product photos, descriptions and size
            details carefully before ordering, or reach out to us with questions beforehand.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-teal">Refund Timelines</h2>
          <p className="mt-2">
            Approved refunds are issued to your original payment method via Razorpay, our payment partner, and
            typically reflect within 5–7 business days depending on your bank.
          </p>
        </section>
      </div>
    </div>
  );
}
