import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CATEGORY_SEEDS } from "@mohini-artistry/shared";
import { useAuthStore } from "../../store/authStore";
import { useCartStore, selectCartItemCount } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useUiStore } from "../../store/uiStore";
import { CartIcon, HeartIcon, MenuIcon, CloseIcon, ChevronDownIcon, UserIcon, LogoutIcon } from "../common/icons";
import { SITE_NAME } from "../../lib/constants";
import LogoutConfirmModal from "./LogoutConfirmModal";

const MOBILE_INFO_LINKS: { label: string; to: string }[] = [
  { label: "How to Order", to: "/how-to-order" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Track Order", to: "/track-order" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors hover:text-turquoise ${isActive ? "text-magenta" : "text-teal"}`;

export default function Header() {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore(selectCartItemCount);
  const wishlistCount = useWishlistStore((s) => s.productIds.size);
  const openCart = useUiStore((s) => s.openCart);

  function handleConfirmLogout() {
    logout();
    setIsLogoutConfirmOpen(false);
    setIsMobileOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setIsMobileOpen(false)}>
          <img src="/logo.png" alt={SITE_NAME} className="h-16 w-auto object-contain" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setIsShopOpen(true)}
            onMouseLeave={() => setIsShopOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-teal hover:text-turquoise"
              onClick={() => setIsShopOpen((v) => !v)}
              aria-expanded={isShopOpen}
            >
              Shop <ChevronDownIcon className="h-4 w-4" />
            </button>
            {isShopOpen && (
              <div className="absolute left-0 top-full w-64 rounded-xl border border-hairline bg-softwhite p-2 shadow-lg">
                <Link
                  to="/shop"
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-teal hover:bg-cream"
                  onClick={() => setIsShopOpen(false)}
                >
                  All Products
                </Link>
                <div className="my-1 h-px bg-hairline" />
                {CATEGORY_SEEDS.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/shop/${cat.slug}`}
                    className="block rounded-lg px-3 py-2 text-sm text-teal hover:bg-cream"
                    onClick={() => setIsShopOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/how-to-order" className={navLinkClass}>
            How to Order
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
          <NavLink to="/track-order" className={navLinkClass}>
            Track Order
          </NavLink>
          {user?.isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative rounded-full p-2 text-teal hover:bg-cream"
          >
            <HeartIcon className="h-5 w-5" />
            {isAuthenticated && wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-magenta text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label="Open cart"
            onClick={openCart}
            className="relative rounded-full p-2 text-teal hover:bg-cream"
          >
            <CartIcon className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-magenta text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? "/account" : "/login")}
            className="hidden items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-teal hover:bg-cream sm:flex"
          >
            <UserIcon className="h-4 w-4" />
            {isAuthenticated ? user?.fullName.split(" ")[0] : "Login"}
          </button>

          {isAuthenticated && (
            <button
              type="button"
              aria-label="Log out"
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="hidden rounded-full p-2 text-teal hover:bg-cream sm:flex"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          )}

          <button
            type="button"
            aria-label="Toggle menu"
            className="rounded-full p-2 text-teal hover:bg-cream md:hidden"
            onClick={() => setIsMobileOpen((v) => !v)}
          >
            {isMobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-hairline bg-softwhite px-4 py-3 md:hidden">
          <span className="px-1 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-secondary">Shop</span>
          <Link to="/shop" className="rounded-lg px-2 py-2 text-sm text-teal hover:bg-cream" onClick={() => setIsMobileOpen(false)}>
            All Products
          </Link>
          {CATEGORY_SEEDS.map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop/${cat.slug}`}
              className="rounded-lg px-2 py-2 text-sm text-teal hover:bg-cream"
              onClick={() => setIsMobileOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
          <div className="my-1 h-px bg-hairline" />
          {MOBILE_INFO_LINKS.map(({ label, to }) => (
            <Link key={to} to={to} className="rounded-lg px-2 py-2 text-sm text-teal hover:bg-cream" onClick={() => setIsMobileOpen(false)}>
              {label}
            </Link>
          ))}
          {user?.isAdmin && (
            <Link to="/admin" className="rounded-lg px-2 py-2 text-sm text-teal hover:bg-cream" onClick={() => setIsMobileOpen(false)}>
              Admin
            </Link>
          )}
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            className="mt-1 rounded-lg bg-cream px-2 py-2 text-sm font-semibold text-teal"
            onClick={() => setIsMobileOpen(false)}
          >
            {isAuthenticated ? `My Account (${user?.fullName.split(" ")[0]})` : "Login / Register"}
          </Link>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-magenta"
            >
              <LogoutIcon className="h-4 w-4" />
              Log Out
            </button>
          )}
        </nav>
      )}

      {isLogoutConfirmOpen && (
        <LogoutConfirmModal onConfirm={handleConfirmLogout} onCancel={() => setIsLogoutConfirmOpen(false)} />
      )}
    </header>
  );
}
