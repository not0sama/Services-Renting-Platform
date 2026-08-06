"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLanguage } = useLanguage();

  return (
    <div
      className="inline-flex items-center p-0.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold"
      style={{ background: "var(--color-panel)" }}
      role="group"
      aria-label="Language selector"
    >
      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 rounded-md transition-colors ${
          lang === "en" ? "bg-[var(--color-signal)] text-white" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        }`}
        style={{ border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("ar")}
        className={`px-2 py-1 rounded-md transition-colors ${
          lang === "ar" ? "bg-[var(--color-signal)] text-white" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        }`}
        style={{ border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}
        aria-pressed={lang === "ar"}
      >
        العربية
      </button>
    </div>
  );
}
