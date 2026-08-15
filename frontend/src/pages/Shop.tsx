import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { Product, ProductSortOption } from "@mohini-artistry/shared";
import { CATEGORY_SEEDS } from "@mohini-artistry/shared";
import { productsApi } from "../api/products";
import ProductGrid from "../components/product/ProductGrid";
import FilterSortBar, { type ProductFilters } from "../components/product/FilterSortBar";
import Spinner from "../components/common/Spinner";

export default function Shop() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const filters: ProductFilters = useMemo(
    () => ({
      minPrice: searchParams.has("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.has("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      bestseller: searchParams.get("bestseller") === "true",
      mostLoved: searchParams.get("mostLoved") === "true",
      topRated: searchParams.get("topRated") === "true",
      sort: (searchParams.get("sort") as ProductSortOption | null) ?? "featured",
    }),
    [searchParams]
  );

  function handleFilterChange(patch: Partial<ProductFilters>) {
    const merged = { ...filters, ...patch };
    const next = new URLSearchParams(searchParams);

    (["minPrice", "maxPrice"] as const).forEach((key) => {
      if (merged[key] != null) next.set(key, String(merged[key]));
      else next.delete(key);
    });
    (["bestseller", "mostLoved", "topRated"] as const).forEach((key) => {
      if (merged[key]) next.set(key, "true");
      else next.delete(key);
    });
    if (merged.sort && merged.sort !== "featured") next.set("sort", merged.sort);
    else next.delete("sort");

    setSearchParams(next, { replace: true });
  }

  useEffect(() => {
    setIsLoading(true);
    productsApi
      .list({
        category: categorySlug,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        bestseller: filters.bestseller || undefined,
        mostLoved: filters.mostLoved || undefined,
        topRated: filters.topRated || undefined,
        sort: filters.sort,
        limit: 48,
      })
      .then((res) => {
        setProducts(res.items);
        setTotal(res.total);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setIsLoading(false));
  }, [categorySlug, filters.minPrice, filters.maxPrice, filters.bestseller, filters.mostLoved, filters.topRated, filters.sort]);

  const category = CATEGORY_SEEDS.find((c) => c.slug === categorySlug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-teal">{category ? category.name : "Shop All"}</h1>
        {category && <p className="mt-1 max-w-2xl text-sm text-secondary">{category.description}</p>}
      </div>

      <FilterSortBar filters={filters} onChange={handleFilterChange} />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-secondary">
              {total} product{total === 1 ? "" : "s"} found
            </p>
            <ProductGrid products={products} />
          </>
        )}
      </div>
    </div>
  );
}
