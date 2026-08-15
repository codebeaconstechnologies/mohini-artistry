interface StarRatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<StarRatingProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

export default function StarRating({ rating, count, size = "sm", showCount = true, className = "" }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, rating));
  const pct = (clamped / 5) * 100;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={`relative inline-block leading-none ${SIZE_CLASSES[size]}`} aria-hidden="true">
        <span className="text-hairline">★★★★★</span>
        <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-gold" style={{ width: `${pct}%` }}>
          ★★★★★
        </span>
      </span>
      <span className="sr-only">{clamped.toFixed(1)} out of 5 stars</span>
      {showCount && count !== undefined && <span className="text-xs text-secondary/70">({count})</span>}
    </span>
  );
}
