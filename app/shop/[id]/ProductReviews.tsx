"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

type Review = {
  id: number;
  product_id: string;
  user_email: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await api.reviews.getByProduct(productId);
      if (res && res.reviews) {
        setReviews(res.reviews);
      }
    } catch {
      // Fallback
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please write a comment.");
      return;
    }
    setSubmitting(true);
    setError("");
    setMsg("");
    try {
      await api.reviews.add({
        productId,
        rating,
        comment: comment.trim(),
        username: user?.username,
      });
      setComment("");
      toast.success("Thank you! Your review has been submitted.");
      await loadReviews();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="border-t border-[#2a231e]/15 pt-14 sm:pt-20" aria-labelledby="reviews-h">
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
        <div>
          <h2 id="reviews-h" className="font-[family-name:var(--font-serif)] text-[length:clamp(30px,3.8vw,44px)] font-medium leading-[1.1]">
            Customer Reviews
          </h2>
          {avgRating && (
            <p className="mt-1 text-sm text-[#6a5c4f] flex items-center gap-2">
              <span className="font-semibold text-[#2a231e]">{avgRating} / 5.0</span>
              <span className="text-amber-500">{"★".repeat(Math.round(Number(avgRating)))}</span>
              <span>· Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
        {/* Reviews list */}
        <div>
          {loading ? (
            <p className="text-sm text-[#6a5c4f]">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="rounded-[22px] bg-[#fbf6ea] p-8 text-center text-[#6a5c4f] border border-[#2a231e]/10">
              <p className="text-base font-medium text-[#2a231e]">No reviews yet</p>
              <p className="mt-1 text-sm">Be the first to share your experience with this product!</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#2a231e]/10">
              {reviews.map((rev) => {
                const date = new Date(rev.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                return (
                  <li key={rev.id} className="py-5 first:pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[15px] text-[#2a231e]">{rev.username}</span>
                        <span className="text-amber-500 text-sm">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                      </div>
                      <span className="text-xs text-[#6a5c4f]">{date}</span>
                    </div>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#6a5c4f]">{rev.comment}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Add review form */}
        <div className="rounded-[26px] bg-white p-6 sm:p-8 shadow-[0_25px_50px_-30px_rgba(42,35,30,0.15),inset_0_0_0_1px_rgba(42,35,30,0.07)]">
          <h3 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-[#2a231e]">
            Write a Review
          </h3>
          <p className="mt-1 text-sm text-[#6a5c4f]">
            Share your thoughts on quality, effectiveness, and aroma.
          </p>

          {user ? (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] mb-1.5">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        s <= rating ? "text-amber-500" : "text-[#2a231e]/20"
                      }`}
                      aria-label={`${s} star`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-[#6a5c4f] font-medium">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] mb-1.5">
                  Review Details
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you like or how it worked for you..."
                  className="w-full rounded-[16px] bg-[#fbf6ea] p-4 text-[15px] text-[#2a231e] outline-none border-[1.5px] border-[#2a231e]/15 focus:border-[#2a231e] focus:bg-white placeholder:text-[#6a5c4f]/60 transition"
                />
              </div>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
              {msg && <p className="text-xs text-emerald-600 font-medium">{msg}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-[#2a231e] px-7 py-3 text-[14.5px] font-medium text-[#f6e9d0] transition duration-300 hover:bg-[#b8613a] active:scale-98 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Post Review"}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-[18px] bg-[#fbf6ea] p-5 text-center border border-[#2a231e]/10">
              <p className="text-sm text-[#6a5c4f]">Please sign in to write a review for this product.</p>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center rounded-full bg-[#2a231e] px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-[#f6e9d0] hover:bg-[#b8613a] transition"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

