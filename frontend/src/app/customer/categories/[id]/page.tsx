"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Filter } from "lucide-react";
import api from "@/lib/api";
import { ProviderCard } from "@/components/ProviderCard";

interface Category {
  id: number;
  name_en: string;
  slug: string;
  booking_mode: string;
}

interface Provider {
  id: number;
  user_id: number;
  name?: string;
  bio?: string;
  city?: string;
  avg_rating: number;
  completed_jobs_count: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  is_online: boolean;
  avatar_url?: string;
}

interface Service {
  id: number;
  provider_id: number;
  title: string;
  description?: string;
  price: number;
  duration_minutes: number;
}

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [category, setCategory] = useState<Category | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"providers" | "services">("providers");
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Category>(`/categories/${id}`),
      api.get<Provider[]>(`/categories/${id}/providers`),
    ])
      .then(([catRes, provRes]) => {
        setCategory(catRes.data);
        setProviders(provRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const canInstantBook = category?.booking_mode === "instant" || category?.booking_mode === "both";
  const canQuote = category?.booking_mode === "quote" || category?.booking_mode === "both";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back + Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category?.name_en}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{providers.length} providers available</p>
          </div>
          <div className="flex gap-2">
            {canQuote && (
              <Link
                href={`/customer/jobs/new?category=${id}`}
                className="btn-secondary text-sm px-4 py-2 rounded-xl"
              >
                Post a Job
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
        {["providers", "services"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "providers" | "services")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "providers" ? "Providers" : "Instant Book"}
          </button>
        ))}
      </div>

      {/* Provider List */}
      {activeTab === "providers" && (
        <div className="grid gap-4">
          {providers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>No providers found in this category yet.</p>
            </div>
          ) : (
            providers.map((p) => (
              <ProviderCard
                key={p.id}
                id={p.id}
                name={p.name ?? `Provider #${p.id}`}
                bio={p.bio}
                city={p.city}
                avgRating={p.avg_rating}
                completedJobs={p.completed_jobs_count}
                tier={p.tier}
                isOnline={p.is_online}
                avatarUrl={p.avatar_url}
              />
            ))
          )}
        </div>
      )}

      {/* Services / Instant Book */}
      {activeTab === "services" && (
        <div className="text-center py-16 text-gray-400">
          <p>Instant Book services coming soon.</p>
          <p className="text-sm mt-1">Browse providers and contact them directly for now.</p>
        </div>
      )}
    </div>
  );
}
