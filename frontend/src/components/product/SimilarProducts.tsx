import { useEffect, useState } from "react";
import type { Product } from "@mohini-artistry/shared";
import { productsApi } from "../../api/products";
import ProductCard from "./ProductCard";
import Spinner from "../common/Spinner";

export default function SimilarProducts({ slug }: { slug: string }) {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    productsApi
      .similar(slug)
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (products === null) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }
  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 font-display text-xl font-semibold text-teal">You May Also Like</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
