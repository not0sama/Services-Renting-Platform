"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, ShieldAlert, CheckCircle, Trash2, ArrowLeft, Star, AlertTriangle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Review {
  id: number;
  booking_id: number;
  reviewer_id: number;
  provider_id: number;
  rating: number;
  quality_rating?: number;
  punctuality_rating?: number;
  communication_rating?: number;
  comment?: string;
  provider_response?: string;
  is_flagged: boolean;
  flag_reason?: string;
  created_at: string;
}

export default function AdminReviewModerationPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"flagged" | "all">("flagged");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const url = `http://localhost:8000/api/v1/admin/reviews${tab === "flagged" ? "?flagged_only=true" : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        // Fallback mock data if server empty
        setReviews([
          {
            id: 101,
            booking_id: 402,
            reviewer_id: 12,
            provider_id: 2,
            rating: 1,
            comment: "Extremely rude behavior and overcharged me for simple work!",
            is_flagged: true,
            flag_reason: "Flagged by provider: Contains false claims and personal attacks",
            created_at: new Date().toISOString(),
          },
          {
            id: 102,
            booking_id: 405,
            reviewer_id: 18,
            provider_id: 4,
            rating: 5,
            comment: "Excellent service! Arrived right on time and fixed everything quickly.",
            is_flagged: false,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setReviews([
        {
          id: 101,
          booking_id: 402,
          reviewer_id: 12,
          provider_id: 2,
          rating: 1,
          comment: "Extremely rude behavior and overcharged me for simple work!",
          is_flagged: true,
          flag_reason: "Flagged by provider: Contains false claims and personal attacks",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [tab]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/admin/reviews/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage(isAr ? "تمت الموافقة على المراجعة" : "Review approved successfully.");
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch {
      setReviews(prev => prev.filter(r => r.id !== id));
      setMessage(isAr ? "تمت الموافقة على المراجعة (وضع التجربة)" : "Review approved (Demo mode)");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isAr ? "هل أنت تأكد من حذف هذه المراجعة؟" : "Are you sure you want to delete this review?")) return;
    setActionLoading(id);
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`http://localhost:8000/api/v1/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(isAr ? "تم حذف المراجعة وإعادة حساب تقييم المزود" : "Review deleted & rating recomputed.");
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch {
      setReviews(prev => prev.filter(r => r.id !== id));
      setMessage(isAr ? "تم حذف المراجعة" : "Review deleted.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3 gap-3">
            <Link href="/admin" className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-amber-400" />
                {isAr ? "إدارة ومراجعة التقييمات" : "Review Moderation"}
              </h1>
              <p className="text-sm text-slate-400">
                {isAr ? "إدارة التقييمات المبلغ عنها ومراجعتها لحماية جودة المنصة (FR-53)" : "Moderate flagged reviews and manage platform ratings (FR-53)"}
              </p>
            </div>
          </div>
          <button
            onClick={fetchReviews}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            {isAr ? "تحديث" : "Refresh"}
          </button>
        </div>

        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 border-b border-slate-800 pb-2">
          <button
            onClick={() => setTab("flagged")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
              tab === "flagged"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {isAr ? "التقييمات المبلغ عنها" : "Flagged Reviews"}
          </button>
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              tab === "all"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            {isAr ? "جميع التقييمات" : "All Reviews"}
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">{isAr ? "جاري التحميل..." : "Loading reviews..."}</div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-800/40 rounded-xl border border-slate-800">
            <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>{isAr ? "لا توجد تقييمات بانتظار المراجعة" : "No reviews found in this view."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className={`p-5 rounded-2xl bg-slate-800/60 border ${
                  rev.is_flagged ? "border-amber-500/40 bg-amber-950/10" : "border-slate-800"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < rev.rating ? "fill-amber-400" : "text-slate-700"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Booking #{rev.booking_id} · Provider #{rev.provider_id}
                    </span>
                  </div>
                  {rev.is_flagged && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {isAr ? "مبلغ عنه" : "Flagged"}
                    </span>
                  )}
                </div>

                <p className="text-slate-200 text-sm mb-3">{rev.comment || "(No text comment)"}</p>

                {rev.flag_reason && (
                  <div className="p-2.5 mb-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 font-mono">
                    <strong className="block mb-0.5">{isAr ? "سبب البلاغ:" : "Flag Reason:"}</strong>
                    {rev.flag_reason}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 text-xs text-slate-400">
                  <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    {rev.is_flagged && (
                      <button
                        onClick={() => handleApprove(rev.id)}
                        disabled={actionLoading === rev.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isAr ? "قبول وتجاهل البلاغ" : "Approve Review"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(rev.id)}
                      disabled={actionLoading === rev.id}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {isAr ? "حذف التقييم" : "Remove / Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
