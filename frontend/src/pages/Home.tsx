import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@mohini-artistry/shared";
import { CATEGORY_SEEDS } from "@mohini-artistry/shared";
import { productsApi } from "../api/products";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import ProductGrid from "../components/product/ProductGrid";
import Spinner from "../components/common/Spinner";
import { getCategoryAccent } from "../lib/categoryAccents";

const CATEGORY_TILE_IMAGE: Record<string, string> = {
  "instant-rangoli": "/categories/instant-rangoli.png",
  "resin-reflections": "/categories/resin-reflections.png",
  "fabric-canvas-art": "/categories/fabric-canvas-art.png",
  "moti-art-decor": "/categories/moti-art-decor.png",
};

function ProductSection({
  title,
  subtitle,
  products,
  isLoading,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  isLoading: boolean;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-teal">{title}</h2>
        <p className="mt-1 text-sm text-secondary">{subtitle}</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <ProductGrid products={products} emptyMessage="Check back soon — new pieces are on the way." />
      )}
    </section>
  );
}

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [mostLoved, setMostLoved] = useState<Product[]>([]);
  const [isLoadingNew, setIsLoadingNew] = useState(true);
  const [isLoadingLoved, setIsLoadingLoved] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const recentSlugs = useRecentlyViewed();

  useEffect(() => {
    productsApi
      .newArrivals()
      .then(setNewArrivals)
      .catch(() => setNewArrivals([]))
      .finally(() => setIsLoadingNew(false));
    productsApi
      .mostLoved()
      .then(setMostLoved)
      .catch(() => setMostLoved([]))
      .finally(() => setIsLoadingLoved(false));
  }, []);

  useEffect(() => {
    if (recentSlugs.length === 0) {
      setRecentlyViewed([]);
      return;
    }
    let cancelled = false;
    Promise.all(recentSlugs.map((slug) => productsApi.getBySlug(slug).catch(() => null))).then((results) => {
      if (!cancelled) setRecentlyViewed(results.filter((p): p is Product => p !== null));
    });
    return () => {
      cancelled = true;
    };
  }, [recentSlugs]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-cream via-softwhite to-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal">
              Handmade in India
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-teal sm:text-5xl">
              Colour, craft and celebration — <span className="text-magenta">handmade</span> for your home
            </h1>
            <p className="mt-4 max-w-lg text-secondary">
              From ready-to-place rangoli sets to glass-smooth resin art and hand-painted fabric canvases, every piece at
              Mohini Artistry is crafted by hand and sent to your doorstep with care.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop" className="rounded-full bg-magenta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover">
                Shop the Collection
              </Link>
              <Link
                to="/how-to-order"
                className="rounded-full border border-teal px-6 py-3 text-sm font-semibold text-teal transition-colors hover:bg-teal hover:text-white"
              >
                How to Order
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {CATEGORY_SEEDS.map((cat) => {
              const accent = getCategoryAccent(cat.slug);
              return (
                <Link
                  key={cat.slug}
                  to={`/shop/${cat.slug}`}
                  className={`group flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl p-5 text-center shadow-sm ring-1 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${accent.bg} ${accent.ring}`}
                >
                  <img
                    src={CATEGORY_TILE_IMAGE[cat.slug]}
                    alt=""
                    className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-110 sm:h-24 sm:w-24"
                    loading="lazy"
                  />
                  <span className={`font-display text-base font-bold sm:text-lg ${accent.text}`}>{cat.name}</span>
                  <span className="line-clamp-2 text-xs text-secondary">{cat.description}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <ProductSection
        title="New Arrivals"
        subtitle="Freshly handcrafted pieces, just added to the gallery."
        products={newArrivals}
        isLoading={isLoadingNew}
      />
      <ProductSection
        title="Most Loved"
        subtitle="Our customers' favourites, loved again and again."
        products={mostLoved}
        isLoading={isLoadingLoved}
      />

      {recentlyViewed.length > 0 && (
        <ProductSection title="Recently Viewed" subtitle="Pick up where you left off." products={recentlyViewed} isLoading={false} />
      )}

      <section className="bg-softwhite py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-8 text-center font-display text-2xl font-semibold text-teal">Why Shop with Mohini Artistry</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Made by Hand",
                body: "Every rangoli, resin piece and canvas is handcrafted in small batches — no two are exactly alike.",
              },
              {
                title: "Packed with Care",
                body: "Fragile pieces are cushioned and boxed carefully so they reach you exactly as they left our workshop.",
              },
              {
                title: "Secure & Simple Checkout",
                body: "Pay confidently via UPI, card or netbanking through Razorpay, and track your order by ID and email.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-softwhite p-6 shadow-sm ring-1 ring-hairline">
                <h3 className="font-display text-lg font-semibold text-teal">{item.title}</h3>
                <p className="mt-2 text-sm text-secondary">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
