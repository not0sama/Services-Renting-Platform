"use client";

import Link from "next/link";
import { Star, MapPin, Award, CheckCircle, Zap } from "lucide-react";

interface ProviderCardProps {
  id: number;
  name: string;
  bio?: string;
  city?: string;
  avgRating: number;
  completedJobs: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  isOnline?: boolean;
  avatarUrl?: string;
  distanceKm?: number;
  bestMatchScore?: number;
  href?: string;
}

const TIER_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  bronze: { label: "Bronze", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-600" },
  silver: { label: "Silver", bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-500" },
  gold: { label: "Gold", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  platinum: { label: "Platinum", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
};

export function ProviderCard({
  id, name, bio, city, avgRating, completedJobs, tier,
  isOnline, avatarUrl, distanceKm, bestMatchScore, href,
}: ProviderCardProps) {
  const tierStyle = TIER_STYLES[tier] ?? TIER_STYLES.bronze;
  const cardHref = href ?? `/customer/providers/${id}`;

  return (
    <Link
      href={cardHref}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      {/* Best match banner */}
      {bestMatchScore !== undefined && bestMatchScore >= 0.8 && (
        <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          AI Best Match — {Math.round(bestMatchScore * 100)}% score
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg">
                {name[0]?.toUpperCase()}
              </div>
            )}
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-violet-700 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${tierStyle.bg} ${tierStyle.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tierStyle.dot}`} />
                {tierStyle.label}
              </span>
              {isOnline && (
                <span className="text-xs text-emerald-600 font-medium">● Online</span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{bio}</p>
        )}

        {/* Stats & Booking Action Row */}
        <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-bold text-gray-900">
              <Star className="w-3.5 h-3.5 fill-[var(--color-ai-bright)] text-[var(--color-ai-bright)]" />
              <span>{avgRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <CheckCircle className="w-3.5 h-3.5 text-[var(--color-trust)]" />
              <span>{completedJobs} jobs</span>
            </div>
            {city && (
              <div className="hidden sm:flex items-center gap-1 text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{city}</span>
              </div>
            )}
          </div>

          <span className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px", borderRadius: "var(--radius-md)" }}>
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Book Service</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
