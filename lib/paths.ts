import type { Locale, TradeMode } from "./types";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function hrefFor(
  lang: Locale,
  path: string,
  trade: TradeMode,
  query?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  params.set("trade", trade);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const pathname = normalized === "/" ? `/${lang}` : `/${lang}${normalized}`;
  return `${pathname}?${params.toString()}`;
}

export function swapLang(pathname: string, search: string, lang: Locale) {
  const parts = pathname.split("/");
  if (parts[1] === "ko" || parts[1] === "en") parts[1] = lang;
  else parts.splice(1, 0, lang);
  return `${parts.join("/")}${search}`;
}
