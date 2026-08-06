"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, ArrowRight, Loader2, Zap,
  Wrench, Home, Scissors, Laptop, Camera, Heart, Brush, Truck,
} from "lucide-react";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const EXAMPLES = [
  { text: "My kitchen sink is leaking under the cabinet and water is dripping onto the floor", category: "Plumbing" },
  { text: "Need someone to install a ceiling fan in my bedroom — it's a 3-metre ceiling", category: "Electrical" },
  { text: "My AC stopped cooling and makes a rattling sound when it starts up", category: "HVAC / AC" },
  { text: "Looking for a house cleaner for a 3-bedroom villa in Riyadh, twice a week", category: "Cleaning" },
  { text: "I want professional photos taken for my restaurant menu and interiors", category: "Photography" },
];

const CATEGORIES = [
  { icon: Wrench,    label: "Plumbing",       slug: "plumbing" },
  { icon: Zap,       label: "Electrical",      slug: "electrical" },
  { icon: Home,      label: "Cleaning",        slug: "house-cleaning" },
  { icon: Brush,     label: "Painting",        slug: "painting" },
  { icon: Laptop,    label: "IT & Smart Home", slug: "it-smart-home" },
  { icon: Scissors,  label: "Personal Care",   slug: "personal-care" },
  { icon: Truck,     label: "Moving",          slug: "moving-hauling" },
  { icon: Camera,    label: "Photography",     slug: "photography" },
  { icon: Heart,     label: "Caregiving",      slug: "caregiving" },
];

import { useLanguage } from "@/context/LanguageContext";

export default function AIAssistPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const charLimit = 1000;

  const EXAMPLES = [
    { text: isAr ? "تسريب مياه من حوض المطبخ تحت الخزانة والمياه تتساقط على الأرض" : "My kitchen sink is leaking under the cabinet and water is dripping onto the floor", category: isAr ? "سباكة" : "Plumbing" },
    { text: isAr ? "أحتاج فني لتركيب مروحة سقف في غرفة النوم على ارتفاع 3 أمتار" : "Need someone to install a ceiling fan in my bedroom — it's a 3-metre ceiling", category: isAr ? "كهرباء" : "Electrical" },
    { text: isAr ? "التكييف توقف عن التبريد وتصدر منه أصوات طقطقة عند التشغيل" : "My AC stopped cooling and makes a rattling sound when it starts up", category: isAr ? "تكييف" : "HVAC / AC" },
    { text: isAr ? "أبحث عن عاملة تنظيف لفيلا من 3 غرف نوم في الرياض، مرتين في الأسبوع" : "Looking for a house cleaner for a 3-bedroom villa in Riyadh, twice a week", category: isAr ? "تنظيف" : "Cleaning" },
    { text: isAr ? "أريد التقاط صور احترافية لقائمة طعام المطعم والديكورات الداخلية" : "I want professional photos taken for my restaurant menu and interiors", category: isAr ? "تصوير" : "Photography" },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 5 || loading) return;
    setLoading(true);
    setError(null);
    try {
      sessionStorage.setItem("ai_assist_text", text.trim());
      router.push("/customer/ai-assist/result");
    } catch {
      setError(isAr ? "حدث خطأ ما. يرجى المحاولة مجدداً." : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-canvas)" }}
    >
      {/* ── Minimal header ────────────────────────────────────── */}
      <header
        className="px-5 sm:px-8 py-4 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <Link href="/customer" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--color-signal)" }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display text-sm font-700" style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-ink)" }}>
            {t.appName}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/customer/categories"
            className="text-xs font-medium"
            style={{ color: "var(--color-ink-muted)", textDecoration: "none" }}
          >
            {isAr ? "أو تصفح الخدمات ←" : "Or browse services →"}
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-12">
        <div className="w-full max-w-xl">

          {/* ── AI identity header ────────────────────────────── */}
          <div className="mb-8">
            <div
              className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full"
              style={{
                background: "var(--color-ai-bg)",
                border: "1px solid var(--color-ai-border)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--color-ai-bright)" }} />
              <span
                className="text-xs font-600 uppercase tracking-wider"
                style={{ color: "var(--color-ai)", fontWeight: 600 }}
              >
                {t.aiAssist.title}
              </span>
            </div>

            <h1
              className="font-display font-800 mb-3"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: "var(--color-ink)",
                textAlign: isAr ? "right" : "left",
              }}
            >
              {isAr ? "صف المشكلة." : "Describe the problem."}
              <br />
              <span style={{ color: "var(--color-ai)" }}>
                {isAr ? "ونحن نتكفل بالباقي." : "We'll handle the rest."}
              </span>
            </h1>

            <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)", textAlign: isAr ? "right" : "left" }}>
              {t.aiAssist.subtitle}
            </p>
          </div>

          {/* ── Input form ────────────────────────────────────── */}
          <form onSubmit={submit}>
            <div
              className="relative rounded-2xl overflow-hidden mb-3"
              style={{
                border: `2px solid ${text.length > 0 ? "var(--color-ai-bright)" : "var(--color-border)"}`,
                background: "var(--color-panel)",
                transition: "border-color 0.15s ease",
                boxShadow: text.length > 0 ? "0 0 0 3px rgba(245,158,11,0.1)" : "none",
              }}
            >
              <textarea
                id="ai-problem-description"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={t.aiAssist.placeholder}
                rows={5}
                maxLength={charLimit}
                className="w-full bg-transparent px-4 pt-4 pb-10 text-sm leading-relaxed resize-none outline-none"
                style={{
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-body)",
                  textAlign: isAr ? "right" : "left",
                }}
              />
              <div
                className="absolute bottom-3 right-4 flex items-center gap-3"
              >
                {error && (
                  <span className="text-xs" style={{ color: "var(--color-caution)" }}>{error}</span>
                )}
                <span
                  className="data-value text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: text.length > charLimit * 0.85
                      ? "var(--color-caution)"
                      : "var(--color-ink-muted)",
                  }}
                >
                  {text.length}/{charLimit}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || text.trim().length < 5}
              className="btn-ai w-full"
              style={{ padding: "13px 24px", fontSize: "15px", borderRadius: "var(--radius-lg)" }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {isAr ? "جاري تحليل طلبك..." : "Analysing your request…"}</>
              ) : (
                <><Sparkles className="w-4 h-4" /> {t.aiAssist.analyzeBtn} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* ── What you get back ─────────────────────────────── */}
          <div
            className="mt-5 grid grid-cols-3 gap-2"
          >
            {[
              { label: isAr ? "الفئة المكتشفة" : "Detected category", sub: isAr ? "سباكة، كهرباء..." : "Plumbing, Electrical…" },
              { label: isAr ? "تقدير التكلفة" : "Cost estimate", sub: isAr ? "نطاق بالريال السعودي" : "SAR min–max range" },
              { label: isAr ? "أفضل 3 محترفين" : "Top 3 providers", sub: isAr ? "السعر · المسافة · المستوى" : "Price · distance · tier" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-3 text-center"
                style={{
                  background: "var(--color-panel)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p className="text-xs font-600 mb-0.5" style={{ fontWeight: 600, color: "var(--color-ink)" }}>
                  {item.label}
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-ink-muted)" }}>
                  {item.sub}
                </p>
              </div>
            ))}
          </div>

          {/* ── Examples ──────────────────────────────────────── */}
          <div className="mt-6">
            <p className="text-xs font-medium mb-2" style={{ color: "var(--color-ink-muted)", textAlign: isAr ? "right" : "left" }}>
              {t.aiAssist.tryExamples}
            </p>
            <div className="space-y-1.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setText(ex.text)}
                  className="w-full text-left rounded-xl px-3 py-2.5 flex items-start gap-3 transition-colors"
                  style={{
                    background: text === ex.text ? "var(--color-ai-bg)" : "var(--color-panel)",
                    border: `1px solid ${text === ex.text ? "var(--color-ai-border)" : "var(--color-border)"}`,
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="badge badge-ai flex-shrink-0 mt-0.5"
                    style={{ gap: 3, whiteSpace: "nowrap" }}
                  >
                    <Sparkles className="w-3 h-3" />
                    {ex.category}
                  </span>
                  <span className="text-xs leading-snug line-clamp-2" style={{ color: "var(--color-ink-soft)", textAlign: isAr ? "right" : "left" }}>
                    {ex.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Skip to manual ────────────────────────────────── */}
          <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--color-border)" }}>
            <p className="text-xs text-center mb-3" style={{ color: "var(--color-ink-muted)" }}>
              Prefer to browse without AI?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/customer/categories" className="btn-ghost text-center" style={{ fontSize: "13px", padding: "9px 16px" }}>
                Browse categories
              </Link>
              <Link href="/customer/jobs/new" className="btn-ghost text-center" style={{ fontSize: "13px", padding: "9px 16px" }}>
                Post job manually
              </Link>
            </div>
          </div>

          {/* ── Bottom categories ─────────────────────────────── */}
          <div className="mt-6">
            <p className="text-xs font-medium mb-2" style={{ color: "var(--color-ink-muted)" }}>
              Or jump directly to a category:
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/customer/categories/${cat.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]"
                  style={{
                    background: "var(--color-panel)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-ink-soft)",
                    textDecoration: "none",
                  }}
                >
                  <cat.icon className="w-3 h-3" />
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
