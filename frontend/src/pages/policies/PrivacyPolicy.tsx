import { CONTACT_EMAIL } from "../../lib/constants";

// Placeholder policy content, appropriate for a small India-based handmade
// goods business — not legal advice. Refine before launch.
export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-teal">Privacy Policy</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-secondary">
        <p>We collect only what we need to run Mohini Artistry smoothly, and we never sell your personal information.</p>

        <section>
          <h2 className="font-display text-lg font-semibold text-teal">What We Collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Account details: name, email, phone number, and a securely hashed password.</li>
            <li>Order details: shipping address, items purchased, and order status.</li>
            <li>Payment information is handled entirely by Razorpay — we never see or store your card, UPI, or bank details.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-teal">How We Use It</h2>
          <p className="mt-2">
            We use your information to process orders, provide order tracking, respond to support requests, and
            improve the products we offer. We do not share your personal data with third parties except our payment
            processor (Razorpay) and courier partners, solely to fulfil your order.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-teal">Cookies & Local Storage</h2>
          <p className="mt-2">
            We use your browser's local storage to keep you logged in and to remember cart items and recently viewed
            products, purely to make shopping more convenient. We don't use this data for third-party advertising.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-teal">Your Choices</h2>
          <p className="mt-2">
            You can request a copy of your data, ask us to correct it, or request account deletion at any time by
            emailing us at {CONTACT_EMAIL}.
          </p>
        </section>
      </div>
    </div>
  );
}
