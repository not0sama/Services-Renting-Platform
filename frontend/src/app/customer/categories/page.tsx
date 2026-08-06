"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Grid3X3, ChevronRight, Search, Zap } from "lucide-react";
import api from "@/lib/api";

interface Category {
  id: number;
  name_en: string;
  slug: string;
  icon_url?: string;
  booking_mode: string;
  children?: Category[];
}

const ICON_FALLBACKS: Record<string, string> = {
  "home": "🏠", "cleaning": "🧹", "plumbing": "🔧", "electrical": "⚡",
  "painting": "🎨", "gardening": "🌿", "moving": "📦", "it": "💻",
  "photography": "📸", "catering": "🍽️", "beauty": "💄", "fitness": "💪",
  "tutoring": "📚", "music": "🎵", "events": "🎉", "car": "🚗",
};

function getCategoryIcon(slug: string, iconUrl?: string) {
  if (iconUrl) return <img src={iconUrl} alt="" className="w-8 h-8 object-contain" />;
  const fallback = ICON_FALLBACKS[slug] ?? "✦";
  return <span className="text-3xl">{fallback}</span>;
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/customer/categories/${category.id}`}
      className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-violet-100 transition-all text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
        {getCategoryIcon(category.slug, category.icon_url)}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm group-hover:text-violet-700 transition-colors">
          {category.name_en}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 capitalize">
          {category.booking_mode === "both" ? "Instant & Quote" : category.booking_mode}
        </p>
      </div>
      {category.children && category.children.length > 0 && (
        <span className="text-[10px] text-violet-500 font-medium">
          {category.children.length} subcategories
        </span>
      )}
    </Link>
  );
}

export default function CustomerCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Category[]>("/categories")
      .then((r) => setCategories(r.data))
      .finally(() => setLoading(false));
  }, []);

  const allFlat: Category[] = categories.flatMap((c) => [c, ...(c.children ?? [])]);
  const filtered = search
    ? allFlat.filter((c) => c.name_en.toLowerCase().includes(search.toLowerCase()))
    : categories;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Browse Services</h1>
        <p className="text-gray-500 mt-1">Find the right service for your needs</p>
      </div>

      {/* AI Assist CTA */}
      <Link
        href="/customer/jobs/new?mode=ai"
        className="flex items-center gap-4 p-5 mb-8 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-95 transition-opacity"
      >
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Zap className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-lg">Not sure what you need?</p>
          <p className="text-violet-100 text-sm">Describe your problem and our AI will find the best match</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white/70" />
      </Link>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
}
