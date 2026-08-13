"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ProviderCardStack from "@/components/ProviderCardStack";
import { useLanguage } from "@/context/LanguageContext";
import {
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Star,
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
  Users,
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
      label: isAr ? "حساب ضمان محمي (Escrow)" : "Escrow-Protected Payments",
      text: isAr ? "تظل أموالك آمنة في الضمان ولا تُطلق للمحترف إلا بعد إتمام العمل ورضاك التام." : "Your payment is held securely in escrow and released only after the job is completed to your satisfaction.",
    },
    {
      icon: Users,
      label: isAr ? "محترفون معتمدون ومقيمون" : "Verified & Rated Providers",
      text: isAr ? "خضع كل محترف للتحقق الإداري والتقييم الحقيقي من مستخدمين سابقين." : "Every provider is identity-verified with transparent ratings and job completion history.",
    },
    {
      icon: Sparkles,
      label: isAr ? "مطابقة ذكية بالذكاء الاصطناعي" : "AI Smart Matching",
      text: isAr ? "صف مشكلتك بلغة بسيطة ليقوم الذكاء الاصطناعي بتحديد الخدمة واقتراح أفضل الخيارات." : "Describe your problem in plain words, and our AI will recommend the top matched specialists.",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-canvas)", color: "var(--color-ink)" }}
    >
      {/* ── Header Navbar ────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
          {/* Brand Wordmark */}
          <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-signal)] flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-lg text-[var(--color-ink)]">
              {t.appName}
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-ink-soft)]">
            <a href="#how-it-works" className="hover:text-[var(--color-ink)] transition-colors">
              {t.nav.howItWorks}
            </a>
            <Link href="/customer/categories" className="hover:text-[var(--color-ink)] transition-colors">
              {t.nav.browseServices}
            </Link>
            <Link href="/customer/ai-assist" className="hover:text-[var(--color-ink)] transition-colors">
              {t.nav.aiAssist}
            </Link>
          </nav>

          {/* Auth Controls */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-sm font-medium px-3.5 py-2 rounded-lg text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
            >
              {t.nav.login}
            </Link>
            <Link href="/register" className="btn-primary" style={{ padding: "8px 18px", fontSize: "14px" }}>
              <span>{t.nav.register}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Aligned Grid Architecture) ─────────────── */}
      <section className="pt-24 pb-16 flex items-center" style={{ background: "var(--color-canvas)" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full">
          {/* 2-Column Grid with align-items: start */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left Column (6 cols): Shared Structure */}
            <div className="lg:col-span-6 text-start flex flex-col justify-between h-full">
              <div>
                {/* Row 1: Shared Eyebrow Header Height (h-7) */}
                <div className="h-7 flex items-center mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    {isAr ? "منصة الخدمات الموثوقة" : "VERIFIED SERVICE MARKETPLACE"}
                  </span>
                </div>

                {/* Row 2: Headline & Subtitle */}
                <h1
                  className="font-display text-start font-bold mb-4"
                  style={{
                    fontSize: "clamp(2.2rem, 4.2vw, 3.3rem)",
                    letterSpacing: "-0.03em",
                    color: "var(--color-ink)",
                    lineHeight: 1.15,
                  }}
                >
                  {isAr ? (
                    <>
                      احجز أفضل المحترفين
                      <br />
                      <span style={{ color: "var(--color-signal)" }}>بأسعار عادلة</span> ودفع محمي.
                    </>
                  ) : (
                    <>
                      The professionals you need,
                      <br />
                      <span style={{ color: "var(--color-signal)" }}>priced fairly</span> and paid safely.
                    </>
                  )}
                </h1>

                <p className="text-sm sm:text-base text-[var(--color-ink-soft)] max-w-lg mb-6 text-start leading-relaxed">
                  {isAr
                    ? "احجز خدمات فورية أو اطلب عروض أسعار خاصة من محترفين معتمدين مع ضمان حساب الإسكرو."
                    : "Book fixed-price service slots instantly or request custom bids from verified professionals with escrow protection."}
                </p>
              </div>

              {/* Row 3: Dual CTA Cards Block */}
              <div>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  {/* CTA Card A: Instant Book */}
                  <Link
                    href="/customer/categories"
                    className="bg-white p-5 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-signal)] transition-all hover:shadow-md group text-start flex flex-col justify-between min-h-[140px]"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[var(--color-ink)] mb-3 group-hover:bg-[var(--color-signal)] group-hover:text-white transition-colors">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h2 className="font-display font-bold text-base text-[var(--color-ink)] mb-1">
                        {isAr ? "حجز فوري" : "Instant Book"}
                      </h2>
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        {isAr ? "خدمات مسبقة السعر وتأكيد مباشر" : "Fixed-price services with instant confirmation"}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[var(--color-signal)]">
                      <span>{isAr ? "تصفح الخدمات" : "Browse Services"}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>

                  {/* CTA Card B: Post a Job */}
                  <Link
                    href="/customer/jobs/new"
                    className="bg-white p-5 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-all hover:shadow-md group text-start flex flex-col justify-between min-h-[140px]"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[var(--color-ink)] mb-3 group-hover:bg-[var(--color-ink)] group-hover:text-white transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <h2 className="font-display font-bold text-base text-[var(--color-ink)] mb-1">
                        {isAr ? "طلب عروض أسعار" : "Post a Job"}
                      </h2>
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        {isAr ? "صف طلبك وقارن عروض المحترفين" : "Request custom quotes & compare bids"}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[var(--color-ink)]">
                      <span>{isAr ? "اطلب عرض سعر" : "Request Bids"}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </div>

                {/* Sub-Link: AI Smart Assist Trigger */}
                <div className="text-start">
                  <Link
                    href="/customer/ai-assist"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-signal)] transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--color-signal)]" />
                    <span>{isAr ? "غير متأكد مما تحتاجه؟ استعن بمساعد الذكاء الاصطناعي ←" : "Not sure what you need? Try AI Smart Assist →"}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column (6 cols): Provider Card Stack Centered */}
            <div className="lg:col-span-6 hidden lg:flex flex-col items-center justify-center">
              <ProviderCardStack />
            </div>

          </div>

          {/* Integrated Stats Bar: Snaps to max-w-7xl Grid Edges */}
          <div className="mt-12 pt-8 border-t border-[var(--color-border)] grid grid-cols-3 gap-6 items-center">
            {/* Stat 1: Left Edge Aligned */}
            <div className="text-start">
              <div className="data-value text-xl sm:text-2xl font-bold text-[var(--color-ink)] font-mono">
                10,000+
              </div>
              <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                {isAr ? "محترف موثق" : "Verified Providers"}
              </div>
            </div>

            {/* Stat 2: Center Aligned */}
            <div className="text-center">
              <div className="data-value text-xl sm:text-2xl font-bold text-[var(--color-ink)] font-mono flex items-center justify-center gap-1">
                4.9 <Star className="w-4 h-4 fill-[var(--color-ink)] text-[var(--color-ink)]" />
              </div>
              <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                {isAr ? "متوسط التقييمات" : "Average Rating"}
              </div>
            </div>

            {/* Stat 3: Right Edge Aligned */}
            <div className="text-end">
              <div className="data-value text-xl sm:text-2xl font-bold text-[var(--color-trust)] font-mono flex items-center justify-end gap-1">
                100% <ShieldCheck className="w-4 h-4 text-[var(--color-trust)]" />
              </div>
              <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                {isAr ? "ضمان مالي (Escrow)" : "Escrow Protected"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories Grid Section ─────────────────────────── */}
      <section className="py-16 bg-white border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight mb-1 text-start">
                {isAr ? "فئات الخدمات" : "Explore Categories"}
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] text-start">
                {isAr ? "تصفح المحترفين والخدمات عبر التخصصات الأساسية" : "Book verified professionals across all core service categories"}
              </p>
            </div>
            <Link
              href="/customer/categories"
              className="mt-3 sm:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-signal)] hover:underline"
            >
              {isAr ? "جميع الفئات" : "View all categories"} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/customer/categories/${cat.slug}`}
                  className="bg-white p-5 rounded-xl border border-[var(--color-border)] flex items-start gap-4 group hover:border-[var(--color-signal)] transition-all text-start"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 text-[var(--color-ink)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-signal)] group-hover:text-white transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm mb-0.5 text-[var(--color-ink)] group-hover:text-[var(--color-signal)] transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-[var(--color-ink-muted)]">
                      {cat.count}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Trust Pillars Section ────────────────────────────── */}
      <section className="py-16 border-t border-[var(--color-border)]" style={{ background: "var(--color-canvas)" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {trustPoints.map((tp, idx) => {
              const IconComponent = tp.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-[var(--color-border)] text-start">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-[var(--color-ink)] flex items-center justify-center mb-4">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[var(--color-ink)] mb-2">
                    {tp.label}
                  </h3>
                  <p className="text-xs leading-relaxed text-[var(--color-ink-soft)]">
                    {tp.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 bg-white border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
              {t.landing.howItWorksTitle}
            </h2>
            <p className="text-xs text-[var(--color-ink-soft)]">
              {isAr ? "3 خطوات بسيطة لإنجاز عملك بأمان وكفاءة" : "3 simple steps to getting your job done safely and efficiently"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: t.landing.step1Title, desc: t.landing.step1Desc },
              { num: "02", title: t.landing.step2Title, desc: t.landing.step2Desc },
              { num: "03", title: t.landing.step3Title, desc: t.landing.step3Desc },
            ].map((step, index) => (
              <div key={index} className="text-start">
                <div className="data-value text-3xl font-bold text-[var(--color-signal)] mb-2 font-mono">
                  {step.num}
                </div>
                <h3 className="font-display text-base font-bold text-[var(--color-ink)] mb-1">
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed text-[var(--color-ink-soft)]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] py-8 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-ink-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[var(--color-signal)] flex items-center justify-center text-white">
              <Zap className="w-3 h-3" />
            </div>
            <span className="font-display font-bold text-sm text-[var(--color-ink)]">
              {t.appName}
            </span>
            <span>— {t.tagline}</span>
          </div>

          <div>
            © {new Date().getFullYear()} {t.appName}. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </div>
        </div>
      </footer>
    </div>
  );
}
