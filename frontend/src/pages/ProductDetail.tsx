import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Product, Review } from "@mohini-artistry/shared";
import { productsApi } from "../api/products";
import { reviewsApi } from "../api/reviews";
import { recordRecentlyViewed } from "../hooks/useRecentlyViewed";
import { useCartStore } from "../store/cartStore";
import { useUiStore } from "../store/uiStore";
import { useCheckoutGate } from "../hooks/useCheckoutGate";
import ProductGallery from "../components/product/ProductGallery";
import StarRating from "../components/common/StarRating";
import PriceTag from "../components/common/PriceTag";
import Badge from "../components/common/Badge";
import ReviewList from "../components/product/ReviewList";
import ReviewForm from "../components/product/ReviewForm";
import SimilarProducts from "../components/product/SimilarProducts";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import { MinusIcon, PlusIcon } from "../components/common/icons";
import { WHATSAPP_NUMBER, CONTACT_FOR_ORDER_MAX_PAISE } from "../lib/constants";

const CUSTOM_PRICE_CATEGORIES: Record<string, string> = {
  "resin-reflections": "Price depends on the size you choose. Contact us to customize this piece.",
  "fabric-canvas-art": "Price depends on the size and design you choose. Contact us to customize this piece.",
  "moti-art-decor": "Price depends on the size and design you choose. Contact us to customize this piece.",
};

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const pushToast = useUiStore((s) => s.pushToast);
  const openCart = useUiStore((s) => s.openCart);
  const goToCheckout = useCheckoutGate();

  const loadReviews = useCallback((productId: number) => {
    reviewsApi
      .list(productId, 1, 20)
      .then((res) => setReviews(res.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setNotFound(false);
    setProduct(null);
    setQuantity(1);
    productsApi
      .getBySlug(slug)
      .then((p) => {
        setProduct(p);
        recordRecentlyViewed(p.slug);
        loadReviews(p.id);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [slug, loadReviews]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={32} />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Product not found"
          message="This piece may have been removed, or the link is incorrect."
          action={
            <Link to="/shop" className="text-sm font-semibold text-turquoise underline">
              Browse the shop
            </Link>
          }
        />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const isContactForOrder = product.pricePaise < CONTACT_FOR_ORDER_MAX_PAISE;
  const customPriceNote = !isContactForOrder && product.categorySlug ? CUSTOM_PRICE_CATEGORIES[product.categorySlug] : undefined;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi, I'd like to enquire about customizing "${product.name}"`
  )}`;
  const contactForOrderHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi, I'd like to order "${product.name}"`
  )}`;

  function handleAddToCart() {
    if (!product) return;
    void addItem(product.id, quantity);
    pushToast(`Added "${product.name}" to cart`, "success");
    openCart();
  }

  function handleBuyNow() {
    if (!product) return;
    void addItem(product.id, quantity);
    goToCheckout();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.categoryName && product.categorySlug && (
            <Link to={`/shop/${product.categorySlug}`} className="text-xs font-semibold uppercase tracking-wide text-turquoise">
              {product.categoryName}
            </Link>
          )}
          <h1 className="mt-1 font-display text-2xl font-bold text-teal sm:text-3xl">{product.name}</h1>

          <div className="mt-2 flex items-center gap-3">
            {product.ratingCount > 0 ? (
              <StarRating rating={product.ratingAvg} count={product.ratingCount} size="md" />
            ) : (
              <span className="text-sm text-secondary">No reviews yet</span>
            )}
            {product.isNewArrival && <Badge variant="new">New</Badge>}
            {product.isBestseller && <Badge variant="bestseller">Bestseller</Badge>}
          </div>

          {!isContactForOrder && (
            <div className="mt-4">
              <PriceTag pricePaise={product.pricePaise} compareAtPaise={product.compareAtPaise} size="lg" />
            </div>
          )}

          {customPriceNote && (
            <div className="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-teal">
              <p>{customPriceNote}</p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block font-semibold text-turquoise underline"
              >
                Contact us for customization
              </a>
            </div>
          )}

          {!isContactForOrder && (
            <p className="mt-2 text-sm font-medium">
              {outOfStock ? (
                <span className="text-red-600">We will create this genuine item for you as per your order & requirement.</span>
              ) : product.stock <= 5 ? (
                <span className="font-semibold text-orange">Only {product.stock} left in stock</span>
              ) : (
                <span className="text-green-700">In stock</span>
              )}
            </p>
          )}

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-secondary">{product.description}</p>

          {isContactForOrder ? (
            <div className="mt-6">
              <a
                href={contactForOrderHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-magenta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover"
              >
                Contact for Order
              </a>
            </div>
          ) : (
            <>
              {!outOfStock && (
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex items-center gap-3 rounded-full border border-hairline px-3 py-1.5">
                    <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="text-secondary">
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      aria-label="Increase quantity"
                      className="text-secondary"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="flex-1 rounded-full border border-teal px-6 py-3 text-sm font-semibold text-teal transition-colors hover:bg-teal hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                  className="flex-1 rounded-full bg-magenta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                  Buy Now
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <section className="mt-14">
        <h2 className="mb-4 font-display text-xl font-semibold text-teal">Reviews</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <ReviewList reviews={reviews} />
          <ReviewForm productId={product.id} onSubmitted={() => loadReviews(product.id)} />
        </div>
      </section>

      <SimilarProducts slug={product.slug} />
    </div>
  );
}
