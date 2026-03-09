"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  const toggleLocale = () => {
    setLocale(locale === "fr" ? "en" : "fr");
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      aria-label={locale === "fr" ? "Switch to English" : "Passer en français"}
      title={locale === "fr" ? "Switch to English" : "Passer en français"}
    >
      <Globe className="h-4 w-4" />
      <span className="uppercase">{locale === "fr" ? "EN" : "FR"}</span>
    </button>
  );
}
