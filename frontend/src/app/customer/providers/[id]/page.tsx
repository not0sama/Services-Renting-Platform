"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Star, MapPin, CheckCircle, Clock, Heart, MessageSquare,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { RatingInput } from "@/components/RatingInput";
import TrustScorePanel from "@/components/TrustScorePanel";
import TierBadge from "@/components/TierBadge";

interface ProviderProfile {
  id: number;
  user_id: number;
  name?: string;
  bio?: string;
  city?: string;
  country?: string;
  is_online: boolean;
  avg_rating: number;
  completed_jobs_count: number;
  trust_score: number;
  tier: string;
  avatar_url?: string;
  years_experience: number;
  service_radius_km: number;
  verification_status: string;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  reviewer_name?: string;
  created_at: string;
}

const TIER_COLORS: Record<string, string> = {
  bronze: "text-amber-700 bg-amber-50",
  silver: "text-gray-600 bg-gray-100",
  gold: "text-yellow-700 bg-yellow-50",
  platinum: "text-violet-700 bg-violet-50",
};

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<ProviderProfile>(`/providers/${id}`),
      api.get<Review[]>(`/reviews/provider/${id}`),
      api.get<{ provider_id: number }[]>("/me/favorites"),
    ])
      .then(([pRes, rRes, favRes]) => {
        setProfile(pRes.data);
        setReviews(rRes.data);
        setIsFavorited(favRes.data.some((f) => f.provider_id === Number(id)));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await api.delete(`/me/favorites/${id}`);
        setIsFavorited(false);
      } else {
        await api.post(`/me/favorites/${id}`, {});
        setIsFavorited(true);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!profile) return <div className="p-8 text-center text-gray-400">Provider not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Profile header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-start gap-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold">
              {profile.name?.[0] ?? "P"}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{profile.name ?? `Provider #${id}`}</h1>
              {profile.verification_status === "approved" && (
                <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
              {profile.is_online && (
                <span className="text-xs text-emerald-600 font-medium">● Online</span>
              )}
              <TierBadge tier={profile.tier} size="sm" />
            </div>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-sm text-gray-500">
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {profile.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {profile.years_experience}yr exp
              </span>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-2 mt-2">
              <RatingInput value={Math.round(profile.avg_rating)} onChange={() => {}} readonly size="sm" />
              <span className="text-sm font-semibold text-gray-900">{profile.avg_rating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({reviews.length} reviews)</span>
              <span className="text-sm text-gray-400">·</span>
              <span className="text-sm text-gray-600">{profile.completed_jobs_count} jobs done</span>
            </div>
          </div>

          {/* Favourite button */}
          <button
            onClick={toggleFavorite}
            className={`flex-shrink-0 p-2 rounded-xl transition-all ${
              isFavorited ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-300 hover:text-red-400 hover:bg-red-50"
            }`}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
          </button>
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Trust Score Panel */}
      <div className="mb-4">
        <TrustScorePanel
          data={{
            trust_score: profile.trust_score,
            tier: profile.tier,
            avg_rating: profile.avg_rating,
          }}
        />
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-violet-600" /> Reviews
        </h2>

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <RatingInput value={r.rating} onChange={() => {}} readonly size="sm" />
                  <span className="text-xs text-gray-400">
                    {r.reviewer_name ?? "Customer"} · {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
