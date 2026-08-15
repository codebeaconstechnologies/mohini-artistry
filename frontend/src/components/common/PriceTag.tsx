import { formatPaise } from "../../lib/money";

interface PriceTagProps {
  pricePaise: number;
  compareAtPaise?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PriceTagProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
};

export default function PriceTag({ pricePaise, compareAtPaise, size = "md", className = "" }: PriceTagProps) {
  const hasDiscount = compareAtPaise != null && compareAtPaise > pricePaise;
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={`font-semibold text-teal ${SIZE_CLASSES[size]}`}>{formatPaise(pricePaise)}</span>
      {hasDiscount && <span className="text-sm text-secondary line-through">{formatPaise(compareAtPaise)}</span>}
    </span>
  );
}
