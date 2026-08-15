import { useState, type FormEvent } from "react";
import { createReviewSchema } from "@mohini-artistry/shared";
import { useAuthStore } from "../../store/authStore";
import { reviewsApi } from "../../api/reviews";
import { useUiStore } from "../../store/uiStore";
import { ApiClientError } from "../../api/client";

export default function ReviewForm({ productId, onSubmitted }: { productId: number; onSubmitted?: () => void }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthGate = useUiStore((s) => s.openAuthGate);
  const pushToast = useUiStore((s) => s.pushToast);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-dashed border-hairline bg-cream/50 p-4 text-sm text-secondary">
        <button type="button" onClick={() => openAuthGate()} className="font-semibold text-teal underline">
          Log in
        </button>{" "}
        to write a review.
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = createReviewSchema.safeParse({ rating, comment: comment.trim() || undefined });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your review.");
      return;
    }
    setIsSubmitting(true);
    try {
      await reviewsApi.create(productId, parsed.data);
      pushToast("Thanks for your review!", "success");
      setComment("");
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not submit your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-hairline p-4">
      <div>
        <span className="mb-1 block text-xs font-medium text-secondary">Your rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} star`} className="text-2xl leading-none">
              <span className={star <= rating ? "text-gold" : "text-hairline"}>★</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="review-comment" className="mb-1 block text-xs font-medium text-secondary">
          Your review (optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none"
          placeholder="Tell other shoppers what you liked about this piece..."
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-magenta px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover disabled:opacity-50"
      >
        {isSubmitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
