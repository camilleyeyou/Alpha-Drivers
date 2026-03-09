import { cookies } from "next/headers";
import fr, { type Dictionary } from "./dictionaries/fr";
import en from "./dictionaries/en";

export type Locale = "fr" | "en";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { fr, en };

/**
 * Get the current locale from cookies (server-side).
 * Falls back to "fr" if no cookie is set.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  if (lang === "en" || lang === "fr") return lang;
  return "fr";
}

/**
 * Get the dictionary for a given locale (server components).
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.fr;
}

/**
 * Get the dictionary for the current request (server components).
 */
export async function getServerDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return getDictionary(locale);
}
