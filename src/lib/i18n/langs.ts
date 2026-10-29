import type { Lang } from "@/lib/domain/types";

/** UI languages for Korea plus export target markets. */
/** Spanish is listed early — Dominican Republic is a primary export market. */
export const langs = ["ko", "es", "en", "fr", "km", "mn"] as const;

export type AppLang = (typeof langs)[number];

export const langMeta: Record<
  Lang,
  { code: string; short: string; native: string; locale: string; markets: string }
> = {
  ko: { code: "ko", short: "KO", native: "한국어", locale: "ko-KR", markets: "Korea" },
  en: { code: "en", short: "EN", native: "English", locale: "en-GH", markets: "Ghana, Africa" },
  es: { code: "es", short: "ES", native: "Español", locale: "es-DO", markets: "Dominican Republic" },
  fr: { code: "fr", short: "FR", native: "Français", locale: "fr-FR", markets: "Africa" },
  km: { code: "km", short: "KM", native: "ខ្មែរ", locale: "km-KH", markets: "Cambodia" },
  mn: { code: "mn", short: "MN", native: "Монгол", locale: "mn-MN", markets: "Mongolia" },
};

export function isLang(value: string | undefined | null): value is Lang {
  return Boolean(value && (langs as readonly string[]).includes(value));
}

export function localeTag(lang: Lang): string {
  return langMeta[lang].locale;
}

/** Site content fields exist in KO/EN; other langs fall back to English copy. */
export function contentFieldLang(lang: Lang): "ko" | "en" {
  return lang === "ko" ? "ko" : "en";
}

export const langPathPattern = langs.join("|");
