"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ProviderSample {
  id: string;
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  rating: number;
  reviewsCount: number;
  distanceEn: string;
  distanceAr: string;
  etaEn: string;
  etaAr: string;
  priceEn: string;
  priceAr: string;
  singleBadgeEn: string;
  singleBadgeAr: string;
  initials: string;
  slug: string;
  accentColor: string;
  gradientBg: string;
  glowShadow: string;
}

const PROVIDERS: ProviderSample[] = [
  {
    id: "p1",
    nameEn: "Ahmad Al-Karimi",
    nameAr: "أحمد الكريملي",
    roleEn: "Master Plumber & Leak Specialist",
    roleAr: "خبير سباكة وكشف تسريبات",
    rating: 4.94,
    reviewsCount: 186,
    distanceEn: "1.8 km away",
    distanceAr: "على بُعد 1.8 كم",
    etaEn: "20 min ETA",
    etaAr: "خلال 20 دقيقة",
    priceEn: "LYD 180",
    priceAr: "180 د.ل",
    singleBadgeEn: "AI Best Match",
    singleBadgeAr: "الأفضل مطابقة",
    initials: "AK",
    slug: "plumbing",
    accentColor: "#1A6EFF",
    gradientBg: "linear-gradient(135deg, #1A6EFF 0%, #1057CC 100%)",
    glowShadow: "0 24px 50px -12px rgba(26, 110, 255, 0.25), 0 0 0 1px rgba(26, 110, 255, 0.18)",
  },
  {
    id: "p2",
    nameEn: "Sara Al-Mansouri",
    nameAr: "سارة المنصوري",
    roleEn: "Licensed Electrician & Automation",
    roleAr: "مهندسة كهرباء وأتمتة",
    rating: 4.98,
    reviewsCount: 242,
    distanceEn: "3.2 km away",
    distanceAr: "على بُعد 3.2 كم",
    etaEn: "15 min ETA",
    etaAr: "خلال 15 دقيقة",
    priceEn: "LYD 220",
    priceAr: "220 د.ل",
    singleBadgeEn: "Top Rated Expert",
    singleBadgeAr: "الأعلى تقييماً",
    initials: "SM",
    slug: "electrical",
    accentColor: "#D97706",
    gradientBg: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
    glowShadow: "0 24px 50px -12px rgba(217, 119, 6, 0.25), 0 0 0 1px rgba(217, 119, 6, 0.18)",
  },
  {
    id: "p3",
    nameEn: "Tariq Bin Ziyad",
    nameAr: "طارق بن زياد",
    roleEn: "Deep Cleaning & HVAC Specialist",
    roleAr: "خبير تنظيف وصيانة تكييف",
    rating: 4.89,
    reviewsCount: 118,
    distanceEn: "4.1 km away",
    distanceAr: "على بُعد 4.1 كم",
    etaEn: "30 min ETA",
    etaAr: "خلال 30 دقيقة",
    priceEn: "LYD 150",
    priceAr: "150 د.ل",
    singleBadgeEn: "Verified Professional",
    singleBadgeAr: "محترف معتمد",
    initials: "TZ",
    slug: "house-cleaning",
    accentColor: "#16A34A",
    gradientBg: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
    glowShadow: "0 24px 50px -12px rgba(22, 163, 74, 0.25), 0 0 0 1px rgba(22, 163, 74, 0.18)",
  },
  {
    id: "p4",
    nameEn: "Omar Al-Mukhtar",
    nameAr: "عمر المختار",
    roleEn: "Interior Painting & Finishing",
    roleAr: "خبير دهانات وتشطيبات",
    rating: 4.92,
    reviewsCount: 156,
    distanceEn: "2.5 km away",
    distanceAr: "على بُعد 2.5 كم",
    etaEn: "25 min ETA",
    etaAr: "خلال 25 دقيقة",
    priceEn: "LYD 200",
    priceAr: "200 د.ل",
    singleBadgeEn: "Quality Guaranteed",
    singleBadgeAr: "جودة مضمونة",
    initials: "OM",
    slug: "painting",
    accentColor: "#8B5CF6",
    gradientBg: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
    glowShadow: "0 24px 50px -12px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.18)",
  },
];

export default function ProviderCardStack() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PROVIDERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % PROVIDERS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + PROVIDERS.length) % PROVIDERS.length);
  };

  return (
    <div className="w-full max-w-[500px] mx-auto relative select-none">
      {/* Header Controls — Bigger & Centered */}
      <div className="h-8 flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-trust)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-trust)]"></span>
          </span>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[var(--color-ink-muted)]">
            {isAr ? "محترفون معتمدون بالقرب منك" : "TOP VERIFIED PROVIDERS"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-white flex items-center justify-center text-[var(--color-ink-soft)] hover:bg-gray-50 transition-colors shadow-xs"
            aria-label="Previous provider"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-[var(--color-ink-muted)] px-1.5">
            {activeIndex + 1} / {PROVIDERS.length}
          </span>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-white flex items-center justify-center text-[var(--color-ink-soft)] hover:bg-gray-50 transition-colors shadow-xs"
            aria-label="Next provider"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating 3D Card Stack Container (Bigger Height & Spacing) */}
      <div
        className="relative w-full h-[330px] sm:h-[345px] animate-float-deck"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {PROVIDERS.map((provider, idx) => {
          const total = PROVIDERS.length;
          const order = (idx - activeIndex + total) % total;

          let zIndex = 0;
          let translateY = 0;
          let rotate = 0;
          let scale = 1;
          let opacity = 0;
          let pointerEvents: "auto" | "none" = "none";
          let boxShadow = "none";
          let borderStyle = "1px solid var(--color-border)";

          if (order === 0) {
            // Front Card: Large floating glow shadow
            zIndex = 30;
            translateY = 0;
            rotate = 0;
            scale = 1;
            opacity = 1;
            pointerEvents = "auto";
            boxShadow = provider.glowShadow;
            borderStyle = `1px solid ${provider.accentColor}40`;
          } else if (order === 1) {
            // Middle Card: Peeking out behind with negative rotation
            zIndex = 20;
            translateY = 22;
            rotate = -2;
            scale = 0.94;
            opacity = 0.88;
            pointerEvents = "auto";
            boxShadow = "0 14px 35px -10px rgba(15, 23, 42, 0.1), 0 0 0 1px var(--color-border)";
          } else if (order === 2) {
            // Back Card: Peeking lower with positive rotation
            zIndex = 10;
            translateY = 44;
            rotate = 2;
            scale = 0.88;
            opacity = 0.65;
            pointerEvents = "auto";
            boxShadow = "0 8px 24px -10px rgba(15, 23, 42, 0.06), 0 0 0 1px var(--color-border)";
          } else {
            // Hidden card waiting turn
            zIndex = 0;
            translateY = 56;
            rotate = 0;
            scale = 0.82;
            opacity = 0;
            pointerEvents = "none";
          }

          const isTop = order === 0;

          return (
            <div
              key={provider.id}
              onClick={() => {
                if (!isTop) setActiveIndex(idx);
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex,
                transform: `translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                transformOrigin: "top center",
                opacity,
                pointerEvents,
                boxShadow,
                border: borderStyle,
                transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                cursor: isTop ? "default" : "pointer",
              }}
              className={`bg-white rounded-3xl p-6 sm:p-7 overflow-hidden transition-all duration-300 ${
                isTop ? "hover:scale-[1.02] hover:-translate-y-1" : ""
              }`}
            >
              {/* Top Accent Line */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ background: provider.gradientBg }}
              />

              {/* Header Badge & Price */}
              <div className="flex items-center justify-between mb-5 pt-1">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold shadow-xs"
                  style={{
                    backgroundColor: `${provider.accentColor}14`,
                    color: provider.accentColor,
                  }}
                >
                  <Zap className="w-3.5 h-3.5" style={{ fill: provider.accentColor }} />
                  {isAr ? provider.singleBadgeAr : provider.singleBadgeEn}
                </span>

                <div className="flex items-baseline gap-1 font-mono">
                  <span className="data-value text-xl sm:text-2xl font-extrabold text-[var(--color-ink)]">
                    {isAr ? provider.priceAr : provider.priceEn}
                  </span>
                </div>
              </div>

              {/* Provider Main Info (Bigger Avatar & Fonts) */}
              <div className="flex items-center gap-4 mb-6">
                {/* Avatar with dynamic gradient */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg"
                    style={{ background: provider.gradientBg }}
                  >
                    {provider.initials}
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-[var(--color-trust)] shadow-xs"
                    title="Online Now"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-[var(--color-ink)] truncate">
                      {isAr ? provider.nameAr : provider.nameEn}
                    </h3>
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-trust)] flex-shrink-0" />
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-[var(--color-ink-soft)] mb-2 truncate">
                    {isAr ? provider.roleAr : provider.roleEn}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-ink-muted)]">
                    <span className="flex items-center gap-1 font-bold text-[var(--color-ink)]">
                      <Star className="w-4 h-4 fill-[var(--color-ai-bright)] text-[var(--color-ai-bright)]" />
                      {provider.rating} <span className="font-normal text-[var(--color-ink-muted)]">({provider.reviewsCount})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[var(--color-signal)]" />
                      {isAr ? provider.distanceAr : provider.distanceEn}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[var(--color-trust)]" />
                      {isAr ? provider.etaAr : provider.etaEn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar (Bigger Button & Spacing) */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs sm:text-sm text-[var(--color-ink-muted)] font-medium">
                  {isAr ? "تأكيد حجز مباشر" : "Instant slot confirmation"}
                </span>

                <Link
                  href={`/customer/categories/${provider.slug}`}
                  className="btn-primary"
                  style={{
                    padding: "10px 22px",
                    fontSize: "14px",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: provider.accentColor,
                  }}
                >
                  <span>{isAr ? "احجز الخدمة" : "Book Service"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pill Indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {PROVIDERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === activeIndex
                ? "w-8 bg-[var(--color-signal)]"
                : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
