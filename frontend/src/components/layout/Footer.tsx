import { Link } from "react-router-dom";
import { CATEGORY_SEEDS } from "@mohini-artistry/shared";
import { SITE_NAME, SITE_TAGLINE } from "../../lib/constants";

export default function Footer() {
  return (
    <footer className="border-t-2 border-gold/40 bg-teal text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <span className="font-display text-lg font-bold text-white">
            Mohini <span className="text-gold">Artistry</span>
          </span>
          <p className="mt-1 text-xs italic text-mist">{SITE_TAGLINE}</p>
          <p className="mt-3 text-sm text-mist">
            Handcrafted instant rangoli sets, resin art and fabric canvas paintings — made by hand, sent with care,
            across India.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-gold">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/90">
            {CATEGORY_SEEDS.map((cat) => (
              <li key={cat.slug}>
                <Link to={`/shop/${cat.slug}`} className="hover:text-gold">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-gold">Help</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/90">
            <li>
              <Link to="/how-to-order" className="hover:text-gold">How to Order</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold">About Us</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold">Contact</Link>
            </li>
            <li>
              <Link to="/track-order" className="hover:text-gold">Track Order</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-gold">Policies</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/90">
            <li>
              <Link to="/policies/shipping" className="hover:text-gold">Shipping Policy</Link>
            </li>
            <li>
              <Link to="/policies/refunds" className="hover:text-gold">Refund &amp; Cancellation</Link>
            </li>
            <li>
              <Link to="/policies/terms" className="hover:text-gold">Terms &amp; Conditions</Link>
            </li>
            <li>
              <Link to="/policies/privacy" className="hover:text-gold">Privacy Policy</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-mist sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            For Website Development Contact{" "}
            <a href="https://codebeacons.in" target="_blank" rel="noopener noreferrer" className="hover:text-gold">
              Codebeacons.in
            </a>{" "}
            · +91 81491 05574
          </span>
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
