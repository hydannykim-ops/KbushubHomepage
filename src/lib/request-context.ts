import "server-only";
import { cookies, headers } from "next/headers";
import { normalizeReferralCode, referralForInquiry } from "./domain/referral";
import type { Lang, TradeMode } from "./domain/types";
import { isLang } from "./i18n/langs";

export function parseLang(value: string | undefined): Lang | null {
  return isLang(value) ? value : null;
}

/** Form/API body lang with Korean fallback. Safe for client-less API routes. */
export function langFromBody(value: unknown): Lang {
  return isLang(typeof value === "string" ? value : null) ? (value as Lang) : "ko";
}

export function parseMode(value: string | null | undefined): TradeMode | null {
  return value === "domestic" || value === "export" ? value : null;
}

export async function requestContext(lang: Lang, _searchParams: URLSearchParams) {
  const jar = await cookies();
  const headerList = await headers();
  // Browsing no longer splits domestic/export; keep a fixed value for legacy call sites.
  const mode: TradeMode = "domestic";
  const ref =
    normalizeReferralCode(headerList.get("x-kb-ref")) ??
    normalizeReferralCode(jar.get("kb_ref_latest")?.value) ??
    normalizeReferralCode(jar.get("kb_ref_first")?.value) ??
    normalizeReferralCode(_searchParams.get("ref"));
  return { lang, mode, ref };
}

export async function referralFromRequest() {
  const jar = await cookies();
  return referralForInquiry(jar.get("kb_ref_first")?.value, jar.get("kb_ref_latest")?.value);
}

export function hrefTo(
  lang: Lang,
  path: string,
  ctx: { mode?: TradeMode; ref: string | null },
  extra?: Record<string, string | null | undefined>,
) {
  const params = new URLSearchParams();
  if (ctx.ref) params.set("ref", ctx.ref);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (key === "mode") continue;
      if (value) params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? `/${lang}${path}?${query}` : `/${lang}${path}`;
}
