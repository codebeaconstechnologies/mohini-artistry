import { useEffect, useState } from "react";
import type { ProductSortOption } from "@mohini-artistry/shared";
import { paiseToRupees, rupeesToPaise } from "../../lib/money";

export interface ProductFilters {
  minPrice?: number; // paise
  maxPrice?: number; // paise
  bestseller?: boolean;
  mostLoved?: boolean;
  topRated?: boolean;
  sort?: ProductSortOption;
}

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
];

const CHIPS: { key: "bestseller" | "mostLoved" | "topRated"; label: string }[] = [
  { key: "bestseller", label: "Bestseller" },
  { key: "mostLoved", label: "Most Loved" },
  { key: "topRated", label: "Top Rated" },
];

export default function FilterSortBar({
  filters,
  onChange,
}: {
  filters: ProductFilters;
  onChange: (patch: Partial<ProductFilters>) => void;
}) {
  const [minInput, setMinInput] = useState(filters.minPrice != null ? String(paiseToRupees(filters.minPrice)) : "");
  const [maxInput, setMaxInput] = useState(filters.maxPrice != null ? String(paiseToRupees(filters.maxPrice)) : "");

  useEffect(() => {
    setMinInput(filters.minPrice != null ? String(paiseToRupees(filters.minPrice)) : "");
    setMaxInput(filters.maxPrice != null ? String(paiseToRupees(filters.maxPrice)) : "");
  }, [filters.minPrice, filters.maxPrice]);

  function applyPriceRange() {
    const min = minInput.trim() !== "" ? rupeesToPaise(Number(minInput)) : undefined;
    const max = maxInput.trim() !== "" ? rupeesToPaise(Number(maxInput)) : undefined;
    onChange({ minPrice: min, maxPrice: max });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-cream/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-secondary">₹</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={applyPriceRange}
            onKeyDown={(e) => e.key === "Enter" && applyPriceRange()}
            className="w-20 rounded-lg border border-hairline px-2 py-1.5 text-sm focus:border-magenta focus:outline-none"
          />
          <span className="text-secondary">–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={applyPriceRange}
            onKeyDown={(e) => e.key === "Enter" && applyPriceRange()}
            className="w-20 rounded-lg border border-hairline px-2 py-1.5 text-sm focus:border-magenta focus:outline-none"
          />
        </div>

        {CHIPS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ [key]: !filters[key] })}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              filters[key] ? "border-magenta bg-magenta text-white" : "border-hairline text-secondary hover:bg-cream"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <select
        value={filters.sort ?? "featured"}
        onChange={(e) => onChange({ sort: e.target.value as ProductSortOption })}
        className="rounded-lg border border-hairline bg-softwhite px-3 py-1.5 text-sm focus:border-magenta focus:outline-none"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
