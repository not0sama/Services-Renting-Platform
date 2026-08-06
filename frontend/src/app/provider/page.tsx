"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Zap, Bell, LayoutDashboard, Briefcase, Package, DollarSign,
  Star, Settings, LogOut, ChevronRight, TrendingUp,
  Clock, CheckCircle, Award, Loader2,
} from "lucide-react";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/lib/api";
import TierBadge from "@/components/TierBadge";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",        href: "/provider",                active: true },
  { icon: Briefcase,       label: "Job Feed",          href: "/provider/jobs" },
  { icon: CheckCircle,     label: "Active Jobs",       href: "/provider/bookings/active" },
  { icon: Package,         label: "My Services",       href: "/provider/services" },
  { icon: Clock,           label: "Availability",      href: "/provider/availability" },
  { icon: DollarSign,      label: "Earnings",          href: "/provider/earnings" },
  { icon: Star,            label: "Reviews",           href: "/provider/reviews" },
  { icon: Settings,        label: "Settings",          href: "/provider/settings" },
];

const TIER_THRESHOLDS = [
  { label: "Bronze", min: 0,  max: 50,  color: "#92400E" },
  { label: "Silver", min: 50, max: 70,  color: "#475569" },
  { label: "Gold",   min: 70, max: 85,  color: "#B45309" },
  { label: "Platinum", min: 85, max: 100, color: "#0E7490" },
];

interface ProviderProfile {
  id: number;
  business_name: string;
  tier: string;
  trust_score: number;
  avg_rating: number;
  completed_jobs_count: number;
  is_online: boolean;
  on_time_rate: number;
  completion_rate: number;
}

function Sidebar({ user, isOnline, onToggle, onLogout }: {
  user: { name?: string; email?: string } | null;
  isOnline: boolean;
  onToggle: () => void;
  onLogout: () => void;
}) {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  const providerNavItems = [
    { icon: LayoutDashboard, label: t.nav.dashboard,        href: "/provider",                active: true },
    { icon: Briefcase,       label: t.nav.jobs,             href: "/provider/jobs" },
    { icon: CheckCircle,     label: isAr ? "وظائف نشطة" : "Active Jobs",       href: "/provider/bookings/active" },
    { icon: Package,         label: t.nav.services,         href: "/provider/services" },
    { icon: Clock,           label: t.nav.availability,     href: "/provider/availability" },
    { icon: DollarSign,      label: t.nav.earnings,         href: "/provider/earnings" },
    { icon: Star,            label: t.nav.reviews,          href: "/provider/reviews" },
    { icon: Settings,        label: t.nav.settings,         href: "/provider/settings" },
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
      <Link href="/" className="flex items-center gap-2 px-3 mb-7" style={{ textDecoration: "none" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--color-signal)" }}>
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-display text-sm font-700 text-white" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
          {t.appName}
        </span>
      </Link>

      {/* Online / Offline toggle */}
      <button
        onClick={onToggle}
        className="mx-3 mb-5 flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors"
        style={{
          background: isOnline ? "rgba(22,163,74,0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${isOnline ? "rgba(22,163,74,0.3)" : "rgba(255,255,255,0.08)"}`,
          cursor: "pointer",
        }}
        aria-label={isOnline ? "Go offline" : "Go online"}
      >
        <div>
          <p className="text-xs font-medium text-left" style={{ color: isOnline ? "#4ade80" : "rgba(255,255,255,0.5)", textAlign: isAr ? "right" : "left" }}>
            {isOnline ? `● ${isAr ? "متصل" : "Online"}` : `○ ${isAr ? "غير متصل" : "Offline"}`}
          </p>
          <p className="text-[11px] text-left" style={{ color: "rgba(255,255,255,0.3)", textAlign: isAr ? "right" : "left" }}>
            {isOnline ? t.provider.acceptingJobs : (isAr ? "غير مرئي للعملاء" : "Not visible to customers")}
          </p>
        </div>
        <div
          className="w-8 h-5 rounded-full relative transition-colors"
          style={{ background: isOnline ? "var(--color-trust)" : "rgba(255,255,255,0.15)" }}
        >
          <div
            className="w-3.5 h-3.5 rounded-full absolute top-0.5 transition-all"
            style={{
              background: "white",
              left: isOnline ? "calc(100% - 18px)" : "2px",
            }}
          />
        </div>
      </button>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {providerNavItems.map((item) => (
          <Link key={item.label} href={item.href} className={`sidebar-link ${item.active ? "active" : ""}`}>
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, marginTop: 16 }}>
        <div className="flex items-center gap-2.5 px-3 mb-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "var(--color-signal)" }}>
            {user?.name?.[0]?.toUpperCase() ?? "P"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{t.roles.provider}</p>
          </div>
        </div>
        <button onClick={onLogout} className="sidebar-link w-full" style={{ cursor: "pointer", border: "none", background: "none", textAlign: isAr ? "right" : "left" }}>
          <LogOut className="w-4 h-4" />
          {t.nav.logout}
        </button>
      </div>
    </aside>
  );
}

export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ProviderProfile>("/providers/me/profile")
      .then(res => {
        setProfile(res.data);
        setIsOnline(res.data.is_online);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);
    try { await api.patch(`/providers/me/online-status?is_online=${next}`); }
    catch { setIsOnline(!next); }
  };

  const score = profile?.trust_score ?? 0;
  const tierSegments = TIER_THRESHOLDS.map(tThreshold => ({
    ...tThreshold,
    label: isAr
      ? tThreshold.label === "Bronze" ? "برونزي" : tThreshold.label === "Silver" ? "فضي" : tThreshold.label === "Gold" ? "ذهبي" : "بلاتيني"
      : tThreshold.label,
    pct: Math.min(100, Math.max(0, ((score - tThreshold.min) / (tThreshold.max - tThreshold.min)) * 100)),
    reached: score >= tThreshold.max,
    active: score >= tThreshold.min && score < tThreshold.max,
  }));

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-canvas)" }}>
      <Sidebar user={user} isOnline={isOnline} onToggle={toggleOnline} onLogout={logout} />

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
            <h1 className="font-display font-700 text-base" style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-ink)", textAlign: isAr ? "right" : "left" }}>
              {t.provider.dashboardTitle}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-ink-muted)", textAlign: isAr ? "right" : "left" }}>
              {user?.name?.split(" ")[0]} — {isOnline ? `● ${t.provider.acceptingJobs}` : `○ ${t.provider.offline}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/provider/notifications"
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              style={{ color: "var(--color-ink-soft)" }}
            >
              <Bell className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto">

          {/* ── Trust Score — THE north-star metric ──────────── */}
          <div
            className="rounded-2xl p-5 mb-5"
            style={{
              background: "var(--color-ink)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4" style={{ color: "var(--color-ai-bright)" }} />
                  <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)", textAlign: isAr ? "right" : "left" }}
                  >
                    {t.provider.trustScoreTitle}
                  </span>
                </div>
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-white opacity-50" />
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span
                      className="data-value"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "3rem",
                        fontWeight: 700,
                        color: "white",
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                      }}
                    >
                      {score.toFixed(1)}
                    </span>
                    <span className="text-white opacity-40 text-sm">/ 100</span>
                    <TierBadge tier={profile?.tier ?? "bronze"} />
                  </div>
                )}
                <p
                  className="text-xs mt-2"
                  style={{ color: "rgba(255,255,255,0.4)", textAlign: isAr ? "right" : "left" }}
                >
                  {t.provider.scoreSubtitle}
                </p>
              </div>
              <Link
                href="/provider/profile"
                className="flex items-center gap-1 text-xs font-medium flex-shrink-0"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.06)",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {t.nav.profile} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tier progress — 4-segment bar */}
            <div>
              <div className="grid grid-cols-4 gap-1 mb-1.5">
                {tierSegments.map((t) => (
                  <div key={t.label} className="relative">
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.1)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${t.reached ? 100 : t.active ? t.pct : 0}%`,
                          background: t.reached ? t.color : t.active ? t.color : "transparent",
                          opacity: t.reached ? 1 : 0.8,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {tierSegments.map((t) => (
                  <span
                    key={t.label}
                    className="text-[10px] font-medium"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: score >= t.min ? t.color : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {t.label} {t.min > 0 ? `≥${t.min}` : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Stats grid ────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              {
                label: t.provider.statsCompleted,
                value: profile?.completed_jobs_count ?? 0,
                icon: CheckCircle,
                accent: "var(--color-trust)",
                bg: "var(--color-trust-light)",
              },
              {
                label: t.provider.statsRating,
                value: profile?.avg_rating ? `${profile.avg_rating.toFixed(1)}` : (isAr ? "جديد" : "New"),
                unit: profile?.avg_rating ? "/ 5.0" : "",
                icon: Star,
                accent: "var(--color-ai-bright)",
                bg: "var(--color-ai-bg)",
              },
              {
                label: isAr ? "نسبة الالتزام بالوقت" : "On-Time Rate",
                value: profile?.on_time_rate ? `${(profile.on_time_rate * 100).toFixed(0)}` : "100",
                unit: "%",
                icon: Clock,
                accent: "var(--color-signal)",
                bg: "var(--color-signal-light)",
              },
              {
                label: isAr ? "نسبة الإنجاز" : "Completion Rate",
                value: profile?.completion_rate ? `${(profile.completion_rate * 100).toFixed(0)}` : "100",
                unit: "%",
                icon: TrendingUp,
                accent: "var(--color-ink-soft)",
                bg: "var(--color-canvas)",
              },
            ].map((stat) => (
              <div key={stat.label} className="card p-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: stat.bg }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: stat.accent }} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="data-value font-600"
                    style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "1.5rem", color: "var(--color-ink)", letterSpacing: "-0.02em" }}
                  >
                    {loading ? "—" : stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-xs" style={{ color: "var(--color-ink-muted)" }}>{stat.unit}</span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--color-ink-muted)" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── Quick actions ─────────────────────────────────── */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                href: "/provider/jobs",
                icon: Briefcase,
                label: "Browse job feed",
                desc: "Find new requests and submit offers",
                accent: "var(--color-signal)",
                bg: "var(--color-signal-light)",
              },
              {
                href: "/provider/bookings/active",
                icon: CheckCircle,
                label: "Active bookings",
                desc: "Manage status and navigate en-route",
                accent: "var(--color-trust)",
                bg: "var(--color-trust-light)",
              },
              {
                href: "/provider/earnings",
                icon: DollarSign,
                label: "Earnings & payouts",
                desc: "Track escrow releases and invoices",
                accent: "var(--color-ink-soft)",
                bg: "var(--color-canvas)",
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="card card-hover flex items-start gap-3 p-4"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: action.bg }}
                >
                  <action.icon className="w-4.5 h-4.5" style={{ color: action.accent }} />
                </div>
                <div>
                  <p
                    className="text-sm font-600 mb-0.5"
                    style={{ fontWeight: 600, color: "var(--color-ink)" }}
                  >
                    {action.label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                    {action.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
