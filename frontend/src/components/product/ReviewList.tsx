import type { Review } from "@mohini-artistry/shared";
import StarRating from "../common/StarRating";
import Badge from "../common/Badge";
import EmptyState from "../common/EmptyState";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <EmptyState title="No reviews yet" message="Be the first to share what you think of this piece." />;
  }

  return (
    <ul className="space-y-5">
      {reviews.map((r) => (
        <li key={r.id} className="border-b border-hairline pb-5 last:border-none">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-teal">{r.userName}</span>
              {r.isVerifiedPurchase && <Badge variant="success">Verified Purchase</Badge>}
            </div>
            <span className="text-xs text-secondary">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
          </div>
          <StarRating rating={r.rating} showCount={false} className="mt-1" />
          {r.comment && <p className="mt-2 text-sm text-secondary">{r.comment}</p>}
        </li>
      ))}
    </ul>
  );
}
