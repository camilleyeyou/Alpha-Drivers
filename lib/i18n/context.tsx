"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import fr, { type Dictionary } from "./dictionaries/fr";
import en from "./dictionaries/en";

export type Locale = "fr" | "en";

interface LanguageContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const dictionaries: Record<Locale, Dictionary> = { fr, en };

const LanguageContext = createContext<LanguageContextValue>({
  locale: "fr",
  t: fr,
  setLocale: () => {},
});

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`;
}

function detectBrowserLocale(): Locale {
  if (typeof window === "undefined") return "fr";

  // Check localStorage first (user preference)
  const saved = localStorage.getItem("lang");
  if (saved === "en" || saved === "fr") return saved;

  // Check browser language
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || "";
  if (browserLang.startsWith("en")) return "en";

  return "fr";
}

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? "fr");

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("lang", newLocale);
    setCookie("lang", newLocale, 365);
    // Update html lang attribute
    document.documentElement.lang = newLocale;
  }, []);

  // On mount: detect browser language if no cookie was set
  useEffect(() => {
    if (!initialLocale) {
      const detected = detectBrowserLocale();
      if (detected !== locale) {
        setLocale(detected);
      } else {
        // Still persist the detected locale
        localStorage.setItem("lang", detected);
        setCookie("lang", detected, 365);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LanguageContext.Provider value={{ locale, t: dictionaries[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
