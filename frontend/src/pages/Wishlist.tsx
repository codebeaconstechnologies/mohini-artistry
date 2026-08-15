import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useWishlistStore } from "../store/wishlistStore";
import ProductGrid from "../components/product/ProductGrid";
import EmptyState from "../components/common/EmptyState";
import Spinner from "../components/common/Spinner";

export default function Wishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useWishlistStore((s) => s.items);
  const isLoading = useWishlistStore((s) => s.isLoading);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    if (isAuthenticated) void fetchWishlist();
  }, [isAuthenticated, fetchWishlist]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Log in to view your wishlist"
          message="Save your favourite pieces here to come back to later."
          action={
            <Link to="/login" className="rounded-full bg-magenta px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover">
              Log In
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display text-3xl font-bold text-teal">Your Wishlist</h1>
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <ProductGrid products={items} emptyMessage="Tap the heart icon on any product to save it here." />
      )}
    </div>
  );
}
