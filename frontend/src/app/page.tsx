"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import {
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  Wrench,
  Home,
  Scissors,
  Laptop,
  Brush,
  Truck,
  Heart,
  Camera,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

export default function LandingPage() {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  const categories = [
    { icon: Wrench,    label: isAr ? "سباكة" : "Plumbing",       slug: "plumbing",          count: isAr ? "240+ محترف" : "240+ providers" },
    { icon: Zap,       label: isAr ? "كهرباء" : "Electrical",      slug: "electrical",        count: isAr ? "180+ محترف" : "180+ providers" },
    { icon: Home,      label: isAr ? "تنظيف منازل" : "House Cleaning",  slug: "house-cleaning",    count: isAr ? "320+ محترف" : "320+ providers" },
    { icon: Brush,     label: isAr ? "دهانات" : "Painting",        slug: "painting",          count: isAr ? "150+ محترف" : "150+ providers" },
    { icon: Laptop,    label: isAr ? "تقنية ومنازل ذكية" : "IT & Smart Home", slug: "it-smart-home",     count: isAr ? "90+ محترف" : "90+ providers" },
    { icon: Scissors,  label: isAr ? "عناية شخصية" : "Personal Care",   slug: "personal-care",     count: isAr ? "210+ محترف" : "210+ providers" },
    { icon: Truck,     label: isAr ? "نقل وعفش" : "Moving",          slug: "moving-hauling",    count: isAr ? "120+ محترف" : "120+ providers" },
    { icon: Camera,    label: isAr ? "تصوير فوتوغرافي" : "Photography",       slug: "photography",       count: isAr ? "85+ محترف" : "85+ providers" },
    { icon: Heart,     label: isAr ? "رعاية منزلية" : "Caregiving",        slug: "caregiving",        count: isAr ? "95+ محترف" : "95+ providers" },
  ];

  const trustPoints = [
    {
      icon: ShieldCheck,
      label: isAr ? "محمي بالضمان" : "Escrow-protected",
      text: isAr ? "يتم الاحتفاظ بمبلغك بعد العمل. تطلقه — أو تفتح نزاعاً — قبل تحرك أي أموال." : "Your payment is held after the job. You release it — or dispute — before any money moves.",
    },
    {
      icon: Star,
      label: isAr ? "مستويات سمعة موثقة" : "Verified reputation tiers",
      text: isAr ? "يحصل كل محترف على درجة ثقة مبنية على البيانات. المستويات البرونزية، الفضية، والذهبية واضحة على كل بطاقة." : "Every provider earns a data-driven Trust Score. Bronze, Silver, Gold, and Platinum tiers are visible on every card.",
    },
    {
      icon: Sparkles,
      label: isAr ? "مطابقة الذكاء الاصطناعي" : "AI Smart Matching",
      text: isAr ? "صف مشكلتك بلغة بسيطة. يحدد الذكاء الاصطناعي الخدمة، يقدر التكلفة، ويعرض أفضل 3 محترفين." : "Describe your problem in plain language. The AI identifies the service, estimates cost, and surfaces the top 3 providers.",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-canvas)", color: "var(--color-ink)" }}
    >
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-signal)" }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-display font-700 text-base tracking-tight"
              style={{ color: "var(--color-ink)", fontWeight: 700 }}
            >
              {t.appName}
            </span>
          </Link>

          {/* Nav links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium"
            style={{ color: "var(--color-ink-soft)" }}
          >
            <a
              href="#how-it-works"
              className="hover:text-[var(--color-ink)] transition-colors"
              style={{ textDecoration: "none" }}
            >
              {t.nav.howItWorks}
            </a>
            <Link
              href="/customer/categories"
              className="hover:text-[var(--color-ink)] transition-colors"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {t.nav.browseServices}
            </Link>
            <Link
              href="/customer/ai-assist"
              className="flex items-center gap-1.5"
              style={{
                textDecoration: "none",
                color: "var(--color-ai)",
                fontWeight: 600,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.nav.aiAssist}
            </Link>
          </nav>

          {/* Auth & Language */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-100"
              style={{ textDecoration: "none", color: "var(--color-ink-soft)" }}
            >
              {t.nav.login}
            </Link>
            <Link href="/register" className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
              {t.nav.register} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero — split composition ─────────────────────────── */}
      <section className="pt-14 min-h-screen flex items-center" style={{ background: "var(--color-canvas)" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full py-20">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left: headline + search + CTA */}
            <div className="lg:col-span-6 xl:col-span-7">
              {/* AI strip */}
              <Link
                href="/customer/ai-assist"
                className="inline-flex items-center gap-2 mb-8 group"
                style={{ textDecoration: "none" }}
              >
                <span
                  className="badge badge-ai"
                  style={{ gap: 5 }}
                >
                  <Sparkles className="w-3 h-3" />
                  {isAr ? "المساعد الذكي" : "AI Smart Assist"}
                </span>
                <span
                  className="text-xs font-medium transition-colors"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {isAr ? "صف مشكلتك ← مطابقة فورية" : "Describe your problem → instant match"}
                </span>
                <ChevronRight
                  className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                  style={{ color: "var(--color-ink-muted)" }}
                />
              </Link>

              {/* Headline */}
              <h1
                className="font-display leading-tight mb-5"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
                  letterSpacing: "-0.03em",
                  color: "var(--color-ink)",
                  lineHeight: 1.12,
                  textAlign: isAr ? "right" : "left",
                }}
              >
                {isAr ? (
                  <>
                    {t.landing.heroTitleLine1}
                    <br />
                    <span style={{ color: "var(--color-signal)" }}>{t.landing.heroTitlePricedFairly}</span>
                    <br />
                    {t.landing.heroTitleLine3}
                  </>
                ) : (
                  <>
                    The professional
                    <br />
                    you need,{" "}
                    <span style={{ color: "var(--color-signal)" }}>priced fairly</span>
                    <br />
                    and paid safely.
                  </>
                )}
              </h1>

              <p
                className="text-base leading-relaxed mb-8 max-w-md"
                style={{ color: "var(--color-ink-soft)", textAlign: isAr ? "right" : "left" }}
              >
                {t.landing.heroSubtitle}
              </p>

              {/* Dual-Path Chooser — Signature Split-Panel Card */}
              <div className="dual-path-card mb-8 max-w-xl">
                {/* Left Side: Instant Book */}
                <Link
                  href="/customer/categories"
                  className="dual-path-side side-instant group"
                  aria-label="Instant Book"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="badge badge-signal">
                        <Zap className="w-3 h-3" />
                        {t.landing.instantBookBadge}
                      </span>
                    </div>
                    <p className="font-display text-base font-700 leading-snug mb-1" style={{ color: "var(--color-ink)", fontWeight: 700, textAlign: isAr ? "right" : "left" }}>
                      {t.landing.instantBookTitle}
                    </p>
                    <p className="text-xs mb-3" style={{ color: "var(--color-ink-muted)", textAlign: isAr ? "right" : "left" }}>
                      {t.landing.instantBookSub}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                    <span className="data-value text-xs font-600" style={{ color: "var(--color-signal)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      {t.landing.instantBookFrom}
                    </span>
                    <span className="text-xs font-semibold flex items-center gap-1 text-[var(--color-signal)] group-hover:translate-x-0.5 transition-transform">
                      {t.landing.instantBookBtn} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>

                {/* Central Divider */}
                <div className="dual-path-divider">
                  <span className="dual-path-or-badge">{t.landing.orBadge}</span>
                </div>

                {/* Right Side: Custom Quote */}
                <Link
                  href="/customer/jobs/new"
                  className="dual-path-side side-quote group"
                  aria-label="Custom Quote"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="badge badge-neutral">
                        <MessageSquare className="w-3 h-3" />
                        {t.landing.customQuoteBadge}
                      </span>
                    </div>
                    <p className="font-display text-base font-700 leading-snug mb-1" style={{ color: "var(--color-ink)", fontWeight: 700, textAlign: isAr ? "right" : "left" }}>
                      {t.landing.customQuoteTitle}
                    </p>
                    <p className="text-xs mb-3" style={{ color: "var(--color-ink-muted)", textAlign: isAr ? "right" : "left" }}>
                      {t.landing.customQuoteSub}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                    <span className="data-value text-xs font-600" style={{ color: "var(--color-ink-soft)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      {t.landing.customQuoteBids}
                    </span>
                    <span className="text-xs font-semibold flex items-center gap-1 text-[var(--color-ink)] group-hover:translate-x-0.5 transition-transform">
                      {t.landing.customQuoteBtn} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-4">
                <span
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: "var(--color-trust)" }} />
                  <span>{t.landing.escrowProtected}</span>
                </span>
                <span
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  <Star className="w-3.5 h-3.5" style={{ color: "var(--color-ai-bright)" }} />
                  <span>{t.landing.verifiedTrustTiers}</span>
                </span>
                <span
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  <MapPin className="w-3.5 h-3.5" style={{ color: "var(--color-signal)" }} />
                  <span>{t.landing.nearYouNow}</span>
                </span>
              </div>
            </div>

            {/* Right: social proof column */}
            <div className="lg:col-span-6 xl:col-span-5 hidden lg:block">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { value: "10,000+", label: t.landing.statProvidersLabel },
                  { value: "50,000+", label: t.landing.statJobsLabel },
                  { value: "4.9 / 5", label: t.landing.statRatingLabel },
                  { value: "100%", label: t.landing.statEscrowLabel },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="card p-5"
                  >
                    <div
                      className="data-value text-2xl font-600 mb-0.5"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        color: "var(--color-ink)",
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--color-ink-muted)", textAlign: isAr ? "right" : "left" }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample provider card — shows the product UI inline */}
              <div
                className="card p-5"
                style={{ border: "1px solid var(--color-border)" }}
              >
                <div
                  className="text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: "var(--color-ink-muted)", textAlign: isAr ? "right" : "left" }}
                >
                  {t.landing.exampleHeader}
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: "var(--color-signal)" }}
                  >
                    AK
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-600" style={{ fontWeight: 600 }}>Ahmad Al-Karimi</span>
                      <span className="badge tier-gold">{t.landing.goldTier}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs mb-2" style={{ color: "var(--color-ink-muted)" }}>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" style={{ color: "var(--color-ai-bright)" }} /> 4.92</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 2.1 km</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t.landing.eta30min}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="badge badge-trust"
                        style={{ gap: 4 }}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {t.landing.verifiedBadge}
                      </span>
                      <span
                        className="badge badge-ai"
                        style={{ gap: 4 }}
                      >
                        <Sparkles className="w-3 h-3" />
                        {t.landing.aiBestMatchBadge}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className="data-value text-sm font-600 mb-1"
                      style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-ink)" }}
                    >
                      SAR 280
                    </div>
                    <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }}>
                      {t.landing.bookBtn}
                    </button>
                  </div>
                </div>
                <div
                  className="mt-3 pt-3 text-xs"
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  <span className="flex items-center gap-1" style={{ textAlign: isAr ? "right" : "left" }}>
                    <ShieldCheck className="w-3 h-3 flex-shrink-0" style={{ color: "var(--color-trust)" }} />
                    {t.landing.escrowNote}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Categories Grid Section ─────────────────────────── */}
      <section className="py-20 bg-white border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-2xl font-800 tracking-tight mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 800, textAlign: isAr ? "right" : "left" }}>
                {isAr ? "استكشف الفئات" : "Explore Categories"}
              </h2>
              <p className="text-sm" style={{ color: "var(--color-ink-muted)", textAlign: isAr ? "right" : "left" }}>
                {isAr ? "احجز محترفين معتمدين في كل مجال" : "Book verified professionals across all major service categories"}
              </p>
            </div>
            <Link
              href="/customer/categories"
              className="mt-4 sm:mt-0 text-sm font-semibold flex items-center gap-1 text-[var(--color-signal)]"
              style={{ textDecoration: "none" }}
            >
              {t.common.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.slug}
                  href={`/customer/categories/${c.slug}`}
                  className="card p-4 flex flex-col items-center text-center card-hover group"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                    style={{ background: "var(--color-signal-light)", color: "var(--color-signal)" }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-600 mb-1" style={{ color: "var(--color-ink)", fontWeight: 600 }}>
                    {c.label}
                  </h3>
                  <span className="text-[10px]" style={{ color: "var(--color-ink-muted)" }}>
                    {c.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ───────────────────────────── */}
      <section id="how-it-works" className="py-20" style={{ background: "var(--color-canvas)" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-800 tracking-tight mb-3" style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>
              {t.landing.howItWorksTitle}
            </h2>
            <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
              {isAr ? "ثلاث خطوات بسيطة لحصولك على الخدمة بأمان وشفافية كاملة" : "Three simple steps to getting work done with complete security and transparency"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {trustPoints.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="card p-8 flex flex-col items-start relative">
                  <span
                    className="data-value text-3xl font-800 mb-4"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)", fontWeight: 800 }}
                  >
                    0{idx + 1}
                  </span>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5" style={{ color: "var(--color-signal)" }} />
                    <h3 className="font-display text-lg font-700" style={{ fontFamily: "var(--font-display)", fontWeight: 700, textAlign: isAr ? "right" : "left" }}>
                      {item.label}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)", textAlign: isAr ? "right" : "left" }}>
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
