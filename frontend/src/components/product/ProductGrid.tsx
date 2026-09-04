import type { Product } from "@mohini-artistry/shared";
import ProductCard from "./ProductCard";
import EmptyState from "../common/EmptyState";

export default function ProductGrid({
  products,
  emptyTitle = "Nothing here yet",
  emptyMessage = "As we craft your order on your demand, so contact us for ordering.",
}: {
  products: Product[];
  emptyTitle?: string;
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
