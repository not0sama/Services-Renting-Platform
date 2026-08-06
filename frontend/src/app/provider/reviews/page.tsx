"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, ChevronDown, Send } from "lucide-react";
import api from "@/lib/api";
import { RatingInput } from "@/components/RatingInput";

interface Review {
  id: number;
  rating: number;
  comment?: string;
  provider_response?: string;
  responded_at?: string;
  created_at: string;
  reviewer_name?: string;
}

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<{ id: number }>("/providers/me/profile").then(r => {
      setProfileId(r.data.id);
      return api.get<Review[]>(`/reviews/provider/${r.data.id}`);
    }).then(r => setReviews(r.data)).finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submitResponse = async (reviewId: number) => {
    setSubmitting(true);
    try {
      await api.post(`/reviews/${reviewId}/response`, { response: responseText });
      setRespondingId(null);
      setResponseText("");
      const r = await api.get<Review[]>(`/reviews/provider/${profileId}`);
      setReviews(r.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-violet-600" /> Reviews
        </h1>
      </div>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 flex items-center gap-5">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
            <RatingInput value={Math.round(avgRating)} onChange={() => {}} readonly size="sm" />
            <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-2">{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No reviews yet. Complete bookings to start receiving reviews.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RatingInput value={r.rating} onChange={() => {}} readonly size="sm" />
                  <span className="text-sm font-medium text-gray-900">{r.reviewer_name ?? "Customer"}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="text-sm text-gray-700 mb-3">{r.comment}</p>}

              {/* Provider response */}
              {r.provider_response ? (
                <div className="mt-2 pl-4 border-l-2 border-violet-200 bg-violet-50 rounded-r-xl px-3 py-2">
                  <p className="text-xs font-medium text-violet-700 mb-0.5">Your Response</p>
                  <p className="text-sm text-gray-700">{r.provider_response}</p>
                </div>
              ) : (
                respondingId === r.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea rows={2} value={responseText} onChange={e => setResponseText(e.target.value)} placeholder="Write your response..." className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => setRespondingId(null)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancel</button>
                      <button onClick={() => submitResponse(r.id)} disabled={submitting || !responseText.trim()} className="flex-1 btn-primary py-1.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1">
                        <Send className="w-3.5 h-3.5" /> Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setRespondingId(r.id)} className="mt-2 text-xs text-violet-600 hover:text-violet-700 font-medium">
                    Reply to this review →
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
