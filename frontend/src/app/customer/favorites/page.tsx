"use client";

import { useEffect, useState } from "react";
import { Heart, Star, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import TierBadge from "@/components/TierBadge";

interface Favorite {
  provider_id: number;
  avg_rating: number | null;
  trust_score: number | null;
  tier: string | null;
  city: string | null;
  created_at: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get<Favorite[]>("/me/favorites")
      .then(r => setFavorites(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (providerId: number) => {
    await api.delete(`/me/favorites/${providerId}`);
    setFavorites(p => p.filter(f => f.provider_id !== providerId));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-current" /> Favorite Providers
      </h1>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Heart className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="mb-4">No favorites yet</p>
          <Link href="/customer/categories" className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold">
            Browse Providers
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map(f => (
            <div key={f.provider_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center font-bold text-violet-600 flex-shrink-0">
                #{f.provider_id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-gray-900 text-sm">Provider #{f.provider_id}</span>
                  {f.tier && <TierBadge tier={f.tier} size="sm" />}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {f.avg_rating != null && (
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-current" /> {f.avg_rating.toFixed(1)}
                    </span>
                  )}
                  {f.city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{f.city}</span>}
                  {f.trust_score != null && <span>Trust: {Math.round(f.trust_score)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/customer/providers/${f.provider_id}`} className="text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
                  View
                </Link>
                <button onClick={() => remove(f.provider_id)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
