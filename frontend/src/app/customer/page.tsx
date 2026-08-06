"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Search, Bell, Sparkles, MapPin, Clock, Star, ShieldCheck,
  Zap, Package, MessageCircle, Settings, LogOut, ChevronRight,
  ArrowRight, LayoutDashboard, Loader2,
} from "lucide-react";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/lib/api";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",     href: "/customer",              active: true },
  { icon: Search,          label: "Browse",         href: "/customer/categories" },
  { icon: Package,         label: "Bookings",       href: "/customer/bookings" },
  { icon: Bell,            label: "Notifications",  href: "/customer/notifications" },
  { icon: Settings,        label: "Settings",       href: "/customer/settings" },
];

const STATUS_COLORS: Record<string, { dot: string; text: string; label: string }> = {
  completed:          { dot: "var(--color-trust)",   text: "var(--color-trust)",   label: "Completed" },
  cancelled:          { dot: "var(--color-caution)",  text: "var(--color-caution)", label: "Cancelled" },
  confirmed:          { dot: "var(--color-signal)",   text: "var(--color-signal)",  label: "Confirmed" },
  revision_requested: { dot: "var(--color-ai-bright)",text: "var(--color-ai)",      label: "Revision" },
  pending:            { dot: "#8B95A3",               text: "#8B95A3",              label: "Pending" },
};

interface RecentBooking { id: number; title: string; status: string; price: number; provider_name?: string; }

function Sidebar({ user, onLogout }: { user: { name?: string; email?: string } | null; onLogout: () => void }) {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  const navItems = [
    { icon: LayoutDashboard, label: t.nav.dashboard,     href: "/customer",              active: true },
    { icon: Search,          label: t.nav.browseServices, href: "/customer/categories" },
    { icon: Package,         label: t.nav.bookings,       href: "/customer/bookings" },
    { icon: Bell,            label: t.nav.notifications,  href: "/customer/notifications" },
    { icon: Settings,        label: t.nav.settings,       href: "/customer/settings" },
  ];

  return (
    <aside
      className="hidden lg:flex flex-col py-5 px-3 fixed left-0 top-0 h-full z-30"
      style={{
        width: 220,
        background: "var(--color-ink)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 px-3 mb-7"
        style={{ textDecoration: "none" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "var(--color-signal)" }}
        >
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <span
          className="font-display text-sm font-700 text-white"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          {t.appName}
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`sidebar-link ${item.active ? "active" : ""}`}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, marginTop: 16 }}>
        <div className="flex items-center gap-2.5 px-3 mb-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "var(--color-signal)" }}
          >
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="sidebar-link w-full"
          style={{ cursor: "pointer", border: "none", background: "none", textAlign: isAr ? "right" : "left" }}
        >
          <LogOut className="w-4 h-4" />
          {t.nav.logout}
        </button>
      </div>
    </aside>
  );
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    api.get<RecentBooking[]>("/bookings?limit=4")
      .then(r => setRecentBookings(r.data.slice(0, 4)))
      .finally(() => setLoadingBookings(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? (isAr ? "مستخدم" : "there");

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--color-canvas)" }}
    >
      <Sidebar user={user} onLogout={logout} />

      <main className="flex-1 lg:ml-[220px]">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 px-6 py-3.5 flex items-center justify-between"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div>
            <h1
              className="font-display font-700 text-base"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-ink)", textAlign: isAr ? "right" : "left" }}
            >
              {t.customer.greeting}، {firstName}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-ink-muted)", textAlign: isAr ? "right" : "left" }}>
              {t.customer.subheading}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/customer/notifications"
              className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{ color: "var(--color-ink-soft)" }}
            >
              <Bell className="w-4 h-4" />
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--color-signal)" }}
              />
            </Link>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "var(--color-signal)" }}
            >
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto">

          {/* ── AI Smart Assistant — amber-primary CTA ─────────── */}
          <div
            className="rounded-2xl p-5 mb-5 flex items-center justify-between gap-4"
            style={{
              background: "var(--color-ai-bg)",
              border: "1.5px solid var(--color-ai-border)",
            }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="badge badge-ai">
                  <Sparkles className="w-3 h-3" />
                  {isAr ? "المساعد الذكي" : "AI Smart Assist"}
                </span>
              </div>
              <h2
                className="font-display font-700 text-base mb-0.5"
                style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-ink)", textAlign: isAr ? "right" : "left" }}
              >
                {t.customer.aiBannerTitle}
              </h2>
              <p className="text-xs" style={{ color: "var(--color-ink-soft)", textAlign: isAr ? "right" : "left" }}>
                {t.customer.aiBannerDesc}
              </p>
            </div>
            <Link
              href="/customer/ai-assist"
              className="btn-ai flex-shrink-0"
              style={{ whiteSpace: "nowrap", padding: "10px 18px", fontSize: "13px" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.customer.tryAiBtn} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* ── Quick actions — Dual path front-and-center ────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: Search,         label: t.nav.browseServices,  href: "/customer/categories",      accent: "var(--color-signal)" },
              { icon: Sparkles,       label: t.nav.aiAssist,        href: "/customer/ai-assist",       accent: "var(--color-ai-bright)" },
              { icon: Package,        label: t.nav.bookings,        href: "/customer/bookings",        accent: "var(--color-ink-soft)" },
              { icon: MessageCircle,  label: t.nav.messages,        href: "/customer/messages",        accent: "var(--color-trust)" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="card card-hover flex flex-col items-start gap-3 p-4"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--color-canvas)" }}
                >
                  <action.icon className="w-4 h-4" style={{ color: action.accent }} />
                </div>
                <span className="text-xs font-medium" style={{ color: "var(--color-ink)", textAlign: isAr ? "right" : "left" }}>
                  {action.label}
                </span>
              </Link>
            ))}
          </div>

          {/* ── Bottom grid ─────────────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-4">

            {/* Recent bookings — 2/3 width */}
            <div className="lg:col-span-2 card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="font-display font-700 text-sm"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-ink)", textAlign: isAr ? "right" : "left" }}
                >
                  {t.customer.activeBookingsTitle}
                </h3>
                <Link
                  href="/customer/bookings"
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: "var(--color-signal)", textDecoration: "none" }}
                >
                  {t.common.viewAll} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingBookings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--color-ink-muted)" }} />
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: "var(--color-canvas)" }}
                  >
                    <Package className="w-5 h-5" style={{ color: "var(--color-ink-muted)" }} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>{t.customer.noActiveBookings}</p>
                  <p className="text-xs mb-4" style={{ color: "var(--color-ink-muted)" }}>
                    {isAr ? "ابحث عن خدمة وقم بحجزك الأول" : "Find a service and make your first booking"}
                  </p>
                  <Link href="/customer/categories" className="btn-primary" style={{ fontSize: "12px", padding: "8px 16px" }}>
                    {t.nav.browseServices}
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentBookings.map((b) => {
                    const sc = STATUS_COLORS[b.status] ?? STATUS_COLORS.pending;
                    return (
                      <Link
                        key={b.id}
                        href={`/customer/bookings/${b.id}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                        style={{ textDecoration: "none" }}
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: sc.dot }}
                          aria-label={sc.label}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--color-ink)" }}>
                            {b.title}
                          </p>
                          <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                            {sc.label}{b.provider_name ? ` · ${b.provider_name}` : ""}
                          </p>
                        </div>
                        <span
                          className="data-value text-xs font-600 flex-shrink-0"
                          style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-ink)" }}
                        >
                          SAR {b.price.toFixed(0)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trust & Safety — 1/3 width */}
            <div className="card p-5">
              <h3
                className="font-display font-700 text-sm mb-4"
                style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-ink)", textAlign: isAr ? "right" : "left" }}
              >
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
                  <div key={item.label} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: item.bg }}
                    >
                      <item.icon className="w-3.5 h-3.5" style={{ color: item.accent }} />
                    </div>
                    <div>
                      <p className="text-xs font-600 mb-0.5" style={{ fontWeight: 600, color: "var(--color-ink)" }}>
                        {item.label}
                      </p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-ink-muted)" }}>
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
