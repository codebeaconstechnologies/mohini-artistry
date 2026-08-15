import { Link } from "react-router-dom";

const STEPS = [
  {
    title: "Browse & Choose",
    body: "Explore instant rangoli sets, resin art and fabric canvas pieces by category, or use filters to find something in your budget and style.",
    emoji: "🔍",
  },
  {
    title: "Add to Cart or Wishlist",
    body: "Add pieces you love straight to your cart, or save them to your wishlist for later — even before you're logged in.",
    emoji: "🛒",
  },
  {
    title: "Create an Account / Log In",
    body: "Sign up or log in when you're ready to check out. Anything already in your cart moves over automatically.",
    emoji: "👤",
  },
  {
    title: "Pay Securely",
    body: "Enter your shipping address and pay confidently via UPI, card or netbanking through Razorpay's secure checkout.",
    emoji: "🔒",
  },
  {
    title: "Track Your Order",
    body: "Use your Order ID and email any time on our Track Order page to see exactly where your order is — placed, prepared, shipped or delivered.",
    emoji: "📦",
  },
];

export default function HowToOrder() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-teal sm:text-4xl">How to Order</h1>
        <p className="mx-auto mt-3 max-w-2xl text-secondary">
          Ordering handcrafted art from Mohini Artistry takes just a few simple steps, from browsing to your doorstep.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative rounded-2xl border border-hairline bg-softwhite p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-lg font-bold text-teal">
                {i + 1}
              </span>
              <span className="text-2xl">{step.emoji}</span>
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-teal">{step.title}</h3>
            <p className="mt-2 text-sm text-secondary">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link to="/shop" className="rounded-full bg-magenta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover">
          Start Browsing
        </Link>
      </div>
    </div>
  );
}
