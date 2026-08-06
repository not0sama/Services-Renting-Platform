"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, Send, Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { RatingInput } from "@/components/RatingInput";

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [quality, setQuality] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quality === 0 || punctuality === 0 || communication === 0) {
      setError("Please rate all three criteria to submit your review.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/reviews", {
        booking_id: parseInt(id),
        quality_rating: quality,
        punctuality_rating: punctuality,
        communication_rating: communication,
        comment: comment.trim() || undefined,
      });
      setDone(true);
      setTimeout(() => router.push("/customer/bookings"), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">⭐</div>
        <h2 className="text-xl font-bold text-gray-900">Review Submitted!</h2>
        <p className="text-gray-500 mt-2">Thank you for your feedback.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Leave a Review</h1>
        <p className="text-sm text-gray-500 mb-6">How was your experience?</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Quality of Work *</span>
                <span className="text-gray-400 font-normal">{quality > 0 ? `${quality}/5` : ""}</span>
              </label>
              <RatingInput value={quality} onChange={setQuality} size="md" />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Punctuality *</span>
                <span className="text-gray-400 font-normal">{punctuality > 0 ? `${punctuality}/5` : ""}</span>
              </label>
              <RatingInput value={punctuality} onChange={setPunctuality} size="md" />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Communication *</span>
                <span className="text-gray-400 font-normal">{communication > 0 ? `${communication}/5` : ""}</span>
              </label>
              <RatingInput value={communication} onChange={setCommunication} size="md" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment (optional)</label>
            <textarea
              rows={4}
              placeholder="Share your experience with this provider..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-4 h-4" /> Submit Review</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
