"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Search, Bell, Sparkles, MapPin, Star, ShieldCheck,
  Zap, Package, MessageCircle, ArrowRight, ChevronRight, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, { dot: string; text: string; label: string }> = {
  completed:          { dot: "var(--color-trust)",   text: "var(--color-trust)",   label: "Completed" },
  cancelled:          { dot: "var(--color-caution)",  text: "var(--color-caution)", label: "Cancelled" },
  confirmed:          { dot: "var(--color-signal)",   text: "var(--color-signal)",  label: "Confirmed" },
  revision_requested: { dot: "var(--color-ai-bright)",text: "var(--color-ai)",      label: "Revision" },
  pending:            { dot: "#8B95A3",               text: "#8B95A3",              label: "Pending" },
};

interface RecentBooking { id: number; title: string; status: string; price: number; provider_name?: string; }

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    api.get<RecentBooking[]>("/bookings?limit=4")
      .then(r => setRecentBookings(r.data.slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? (isAr ? "مستخدم" : "there");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-2xs">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--color-ink)]">
            {t.customer.greeting}، {firstName} 👋
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            {t.customer.subheading}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/customer/categories"
            className="btn-primary"
            style={{ padding: "9px 18px", fontSize: "13px" }}
          >
            <Search className="w-4 h-4" />
            <span>{t.nav.browseServices}</span>
          </Link>
        </div>
      </div>

      {/* Announcements Banner */}
      <CustomerAnnouncementBanner />

      {/* AI Smart Assistant CTA */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
        style={{
          background: "var(--color-ai-bg)",
          border: "1.5px solid var(--color-ai-border)",
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-ai inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              {isAr ? "المساعد الذكي" : "AI Smart Assist"}
            </span>
          </div>
          <h2 className="font-display font-bold text-lg text-[var(--color-ink)] mb-1">
            {t.customer.aiBannerTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-ink-soft)]">
            {t.customer.aiBannerDesc}
          </p>
        </div>

        <Link
          href="/customer/ai-assist"
          className="btn-ai flex-shrink-0"
          style={{ whiteSpace: "nowrap", padding: "10px 20px", fontSize: "13px" }}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.customer.tryAiBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Search,         label: t.nav.browseServices,  href: "/customer/categories",      accent: "var(--color-signal)" },
          { icon: Sparkles,       label: t.nav.aiAssist,        href: "/customer/ai-assist",       accent: "var(--color-ai-bright)" },
          { icon: Package,        label: t.nav.bookings,        href: "/customer/bookings",        accent: "var(--color-ink-soft)" },
          { icon: MessageCircle,  label: t.nav.messages,        href: "/customer/messages",        accent: "var(--color-trust)" },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="bg-white p-5 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-signal)] transition-all hover:shadow-md flex flex-col items-start gap-3 text-decoration-none group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:scale-105"
              style={{ background: "var(--color-canvas)" }}
            >
              <action.icon className="w-5 h-5" style={{ color: action.accent }} />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[var(--color-ink)]">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Main Grid: Active Bookings & Trust Pillars */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings — 2 Cols */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-base text-[var(--color-ink)]">
              {t.customer.activeBookingsTitle}
            </h3>
            <Link
              href="/customer/bookings"
              className="flex items-center gap-1 text-xs font-bold text-[var(--color-signal)] hover:underline"
            >
              {t.common.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingBookings ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-ink-muted)]" />
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-[var(--color-ink-muted)]" />
              </div>
              <p className="text-sm font-bold text-[var(--color-ink)] mb-1">
                {t.customer.noActiveBookings}
              </p>
              <p className="text-xs text-[var(--color-ink-muted)] mb-5">
                {isAr ? "ابحث عن خدمة وقم بحجزك الأول" : "Find a service and make your first booking"}
              </p>
              <Link href="/customer/categories" className="btn-primary" style={{ fontSize: "13px", padding: "9px 18px" }}>
                {t.nav.browseServices}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentBookings.map((b) => {
                const sc = STATUS_COLORS[b.status] ?? STATUS_COLORS.pending;
                return (
                  <Link
                    key={b.id}
                    href={`/customer/bookings/${b.id}`}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 hover:border-[var(--color-signal)] hover:bg-gray-50 transition-all text-decoration-none"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: sc.dot }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--color-ink)] truncate">
                        {b.title}
                      </p>
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        {sc.label}{b.provider_name ? ` · ${b.provider_name}` : ""}
                      </p>
                    </div>
                    <span className="data-value text-sm font-bold text-[var(--color-ink)] font-mono">
                      LYD {b.price.toFixed(0)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Trust & Safety Panel */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)]">
          <h3 className="font-display font-bold text-base text-[var(--color-ink)] mb-4">
            {t.customer.protectionsTitle}
          </h3>
          <div className="space-y-4">
            {[
              {
                icon: ShieldCheck,
                label: t.landing.escrowProtected,
                text: isAr ? "ادفع عند الحجز — يُفرج عن المبلغ عند موافقتك." : "Pay after booking — released when you approve.",
                accent: "var(--color-trust)",
                bg: "var(--color-trust-light)",
              },
              {
                icon: Star,
                label: t.customer.verifiedGuaranteeTitle,
                text: isAr ? "فحص الهوية، مستويات الثقة، ومراجعات حقيقية." : "ID-checked, tier-rated, multi-criteria reviewed.",
                accent: "var(--color-ai-bright)",
                bg: "var(--color-ai-bg)",
              },
              {
                icon: Sparkles,
                label: isAr ? "أفضل مطابقة بالذكاء الاصطناعي" : "AI best match",
                text: isAr ? "ترتيب حسب السعر، المسافة، التقييم، والسرعة." : "Ranked by price, distance, rating & speed.",
                accent: "var(--color-ai-bright)",
                bg: "var(--color-ai-bg)",
              },
              {
                icon: MapPin,
                label: isAr ? "تتبع حي مباشر" : "Live tracking",
                text: isAr ? "شاهد مقدم الخدمة في طريقه إليك مباشرة." : "See your provider en-route in real time.",
                accent: "var(--color-signal)",
                bg: "var(--color-signal-light)",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.bg }}
                >
                  <item.icon className="w-4 h-4" style={{ color: item.accent }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--color-ink)] mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerAnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  useEffect(() => {
    api.get<any[]>("/announcements").then(r => setAnnouncements(r.data)).catch(() => {});
  }, []);

  if (!announcements || announcements.length === 0) return null;

  return (
    <div className="space-y-2">
      {announcements.map((a: any) => (
        <div key={a.id} className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-[var(--color-signal)] text-white mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-blue-950">{a.title}</div>
            <div className="text-xs text-blue-800 leading-relaxed mt-0.5">{a.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
