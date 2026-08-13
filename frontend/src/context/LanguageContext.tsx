"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/lib/i18n/strings.en";
import ar from "@/lib/i18n/strings.ar";
import type { Strings } from "@/lib/i18n/strings.en";

export type Language = "en" | "ar";

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: Strings;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLanguage: () => {},
  t: en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("hrp_lang") as Language;
    if (saved === "en" || saved === "ar") {
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("hrp_lang", newLang);
  };

  const t = lang === "ar" ? ar : en;

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
