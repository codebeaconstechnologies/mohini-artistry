import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@mohini-artistry/shared";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useUiStore } from "../../store/uiStore";
import PriceTag from "../common/PriceTag";
import StarRating from "../common/StarRating";
import Badge from "../common/Badge";
import { HeartIcon } from "../common/icons";
import { getCategoryAccent } from "../../lib/categoryAccents";

export default function ProductCard({ product }: { product: Product }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addItem = useCartStore((s) => s.addItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const openAuthGate = useUiStore((s) => s.openAuthGate);
  const pushToast = useUiStore((s) => s.pushToast);
  const openCart = useUiStore((s) => s.openCart);

  const primaryImage = product.images[0];
  const outOfStock = product.stock <= 0;
  const categoryAccent = getCategoryAccent(product.categorySlug);

  function handleAddToCart(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    void addItem(product.id, 1);
    pushToast(`Added "${product.name}" to cart`, "success");
    openCart();
  }

  function handleWishlist(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthGate();
      return;
    }
    void toggleWishlist(product.id);
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-softwhite transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-cream">
        {primaryImage && (
          <img
            src={primaryImage.url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNewArrival && <Badge variant="new">New</Badge>}
          {product.isBestseller && <Badge variant="bestseller">Bestseller</Badge>}
        </div>
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-secondary shadow hover:text-magenta"
        >
          <HeartIcon filled={isWishlisted} className={`h-4 w-4 ${isWishlisted ? "text-magenta" : ""}`} />
        </button>
        {outOfStock && (
          <div className="absolute inset-x-0 bottom-0 bg-teal/85 py-1 text-center text-xs font-semibold text-white">
            Out of Stock
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {product.categoryName && (
          <span className={`text-[11px] font-medium uppercase tracking-wide ${categoryAccent.text}`}>{product.categoryName}</span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-teal">{product.name}</h3>
        {product.ratingCount > 0 && <StarRating rating={product.ratingAvg} count={product.ratingCount} />}
        <div className="mt-auto pt-1">
          <PriceTag pricePaise={product.pricePaise} compareAtPaise={product.compareAtPaise} size="sm" />
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="mt-1 w-full rounded-full bg-magenta py-1.5 text-xs font-semibold text-white transition-colors hover:bg-magenta-hover disabled:cursor-not-allowed disabled:bg-hairline disabled:text-secondary"
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}
