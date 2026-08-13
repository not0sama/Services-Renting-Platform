"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Zap,
  Sparkles,
  Paintbrush,
  Trees,
  Truck,
  Laptop,
  Camera,
  Utensils,
  Scissors,
  Dumbbell,
  GraduationCap,
  Music,
  PartyPopper,
  Car,
  Home,
  Grid3X3,
  Search,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Tag,
  Wind,
  Fan,
  Hammer,
  Bug,
  Layers,
  Settings,
  Tv,
} from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface Category {
  id: number;
  name_en: string;
  slug: string;
  icon_url?: string;
  booking_mode: string;
  children?: Category[];
}

const CATEGORY_ICON_MAP: Record<string, { icon: any; color: string; bg: string }> = {
  // HVAC & AC Repair
  hvac:         { icon: Wind,          color: "text-cyan-600",    bg: "bg-cyan-50 border-cyan-100" },
  ac:           { icon: Wind,          color: "text-cyan-600",    bg: "bg-cyan-50 border-cyan-100" },
  air:          { icon: Wind,          color: "text-cyan-600",    bg: "bg-cyan-50 border-cyan-100" },
  cool:         { icon: Wind,          color: "text-cyan-600",    bg: "bg-cyan-50 border-cyan-100" },

  // Appliance Repair
  appliance:    { icon: Settings,      color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },
  fridge:       { icon: Settings,      color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },
  washer:       { icon: Settings,      color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },

  // Handyman Services
  handyman:     { icon: Hammer,        color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
  hammer:       { icon: Hammer,        color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
  fix:          { icon: Hammer,        color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },

  // Pest Control
  pest:         { icon: Bug,           color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
  bug:          { icon: Bug,           color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
  insect:       { icon: Bug,           color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },

  // Roofing & Insulation
  roof:         { icon: Layers,        color: "text-stone-700",   bg: "bg-stone-100 border-stone-200" },
  insulat:      { icon: Layers,        color: "text-stone-700",   bg: "bg-stone-100 border-stone-200" },

  // Existing Core Categories
  plumb:        { icon: Wrench,        color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
  electric:     { icon: Zap,           color: "text-amber-500",   bg: "bg-amber-50 border-amber-100" },
  clean:        { icon: Sparkles,      color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  paint:        { icon: Paintbrush,    color: "text-violet-600",  bg: "bg-violet-50 border-violet-100" },
  garden:       { icon: Trees,         color: "text-green-600",   bg: "bg-green-50 border-green-100" },
  move:         { icon: Truck,         color: "text-orange-600",  bg: "bg-orange-50 border-orange-100" },
  moving:       { icon: Truck,         color: "text-orange-600",  bg: "bg-orange-50 border-orange-100" },
  it:           { icon: Laptop,        color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },
  tech:         { icon: Laptop,        color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },
  photo:        { icon: Camera,        color: "text-pink-600",    bg: "bg-pink-50 border-pink-100" },
  cater:        { icon: Utensils,      color: "text-red-600",     bg: "bg-red-50 border-red-100" },
  food:         { icon: Utensils,      color: "text-red-600",     bg: "bg-red-50 border-red-100" },
  beaut:        { icon: Scissors,      color: "text-rose-600",    bg: "bg-rose-50 border-rose-100" },
  hair:         { icon: Scissors,      color: "text-rose-600",    bg: "bg-rose-50 border-rose-100" },
  fit:          { icon: Dumbbell,      color: "text-teal-600",    bg: "bg-teal-50 border-teal-100" },
  gym:          { icon: Dumbbell,      color: "text-teal-600",    bg: "bg-teal-50 border-teal-100" },
  tutor:        { icon: GraduationCap, color: "text-sky-600",     bg: "bg-sky-50 border-sky-100" },
  educat:       { icon: GraduationCap, color: "text-sky-600",     bg: "bg-sky-50 border-sky-100" },
  music:        { icon: Music,         color: "text-purple-600",  bg: "bg-purple-50 border-purple-100" },
  event:        { icon: PartyPopper,   color: "text-fuchsia-600", bg: "bg-fuchsia-50 border-fuchsia-100" },
  car:          { icon: Car,           color: "text-slate-700",   bg: "bg-slate-100 border-slate-200" },
  auto:         { icon: Car,           color: "text-slate-700",   bg: "bg-slate-100 border-slate-200" },
  home:         { icon: Home,          color: "text-blue-700",    bg: "bg-blue-50 border-blue-100" },
};

function getCategoryIcon(slug: string, name: string, iconUrl?: string) {
  if (iconUrl) {
    return (
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-100 shadow-2xs group-hover:scale-105 transition-all">
        <img src={iconUrl} alt="" className="w-7 h-7 object-contain" />
      </div>
    );
  }

  const key = `${slug} ${name}`.toLowerCase();
  const matchedKey = Object.keys(CATEGORY_ICON_MAP).find((k) => key.includes(k));
  const style = matchedKey
    ? CATEGORY_ICON_MAP[matchedKey]
    : { icon: Grid3X3, color: "text-[var(--color-signal)]", bg: "bg-blue-50 border-blue-100" };
  const IconComponent = style.icon;

  return (
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${style.bg} transition-all group-hover:scale-105 shadow-2xs`}>
      <IconComponent className={`w-7 h-7 ${style.color}`} />
    </div>
  );
}

function CategoryCard({ category, isAr }: { category: Category; isAr: boolean }) {
  const bookingModeLabel =
    category.booking_mode === "both"
      ? isAr ? "حجز مباشر وعروض" : "Instant & Quote"
      : category.booking_mode === "instant"
      ? isAr ? "حجز فورى" : "Instant Book"
      : isAr ? "طلب عرض سعر" : "Custom Quote";

  return (
    <Link
      href={`/customer/categories/${category.id}`}
      className="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-[var(--color-border)] shadow-2xs hover:shadow-md hover:-translate-y-1 hover:border-[var(--color-signal)] transition-all text-center text-decoration-none"
    >
      {getCategoryIcon(category.slug, category.name_en, category.icon_url)}

      <div className="space-y-1">
        <h3 className="font-display font-bold text-sm text-[var(--color-ink)] group-hover:text-[var(--color-signal)] transition-colors">
          {category.name_en}
        </h3>
        <p className="text-xs font-semibold text-[var(--color-ink-muted)]">
          {bookingModeLabel}
        </p>
      </div>

      {category.children && category.children.length > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[var(--color-signal)] border border-blue-100 mt-1">
          {category.children.length} {isAr ? "تخصصات فرعية" : "subcategories"}
        </span>
      )}
    </Link>
  );
}

export default function CustomerCategoriesPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[var(--color-border)] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-[var(--color-ink)] flex items-center gap-2.5">
            <Grid3X3 className="w-6 h-6 text-[var(--color-signal)]" />
            <span>{isAr ? "جميع تخصصات الخدمات" : "Service Categories"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            {isAr
              ? "اختر التخصص المطلوب لاستعراض المحترفين الموثوقين وحجز الخدمات مباشرة"
              : "Browse verified professionals and instant services across all core categories"}
          </p>
        </div>

        <Link
          href="/customer/jobs/new?mode=ai"
          className="btn-ai shrink-0"
          style={{ padding: "10px 20px", fontSize: "13px", whiteSpace: "nowrap" }}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAr ? "المساعد الذكي بالمطابقة" : "AI Smart Match"}</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]" />
        <input
          type="text"
          placeholder={isAr ? "ابحث عن خدمة أو تخصص (مثل تكييف، صيانة أجهزة، صيانة عامة)..." : "Search service categories (e.g. HVAC, Appliance Repair, Handyman)..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--color-border)] bg-white text-sm font-semibold text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:ring-2 focus:ring-[var(--color-signal)] focus:outline-none shadow-2xs"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-white border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-[var(--color-border)] text-center p-6">
          <Grid3X3 className="w-12 h-12 text-[var(--color-ink-muted)] mb-3 opacity-40" />
          <p className="font-bold text-sm text-[var(--color-ink)] mb-1">
            {isAr ? "لم يتم العثور على تخصصات مطابقة" : "No matching categories found"}
          </p>
          <p className="text-xs text-[var(--color-ink-muted)]">
            {isAr ? "جرب البحث عن كلمة أخرى مثل تكييف أو أجهزة أو صيانة" : "Try searching for another keyword like HVAC or handyman"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((cat) => (
            <CategoryCard key={cat.id} category={cat} isAr={isAr} />
          ))}
        </div>
      )}
    </div>
  );
}
