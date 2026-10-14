import "server-only";
import { cookies, headers } from "next/headers";
import { normalizeReferralCode, referralForInquiry } from "./domain/referral";
import type { Lang, TradeMode } from "./domain/types";

export function parseLang(value: string | undefined): Lang | null {
  return value === "ko" || value === "en" ? value : null;
}

export function parseMode(value: string | null | undefined): TradeMode | null {
  return value === "domestic" || value === "export" ? value : null;
}

export async function requestContext(lang: Lang, searchParams: URLSearchParams) {
  const jar = await cookies();
  const headerList = await headers();
  const mode =
    parseMode(searchParams.get("mode")) ??
    parseMode(headerList.get("x-kb-mode")) ??
    parseMode(jar.get("kb_mode")?.value) ??
    "domestic";
  const ref =
    normalizeReferralCode(searchParams.get("ref")) ??
    normalizeReferralCode(headerList.get("x-kb-ref")) ??
    normalizeReferralCode(jar.get("kb_ref_latest")?.value) ??
    normalizeReferralCode(jar.get("kb_ref_first")?.value);
  return { lang, mode, ref };
}

export async function referralFromRequest() {
  const jar = await cookies();
  return referralForInquiry(jar.get("kb_ref_first")?.value, jar.get("kb_ref_latest")?.value);
}

export function hrefTo(
  lang: Lang,
  path: string,
  ctx: { mode: TradeMode; ref: string | null },
  extra?: Record<string, string | null | undefined>,
) {
  const params = new URLSearchParams();
  params.set("mode", ctx.mode);
  if (ctx.ref) params.set("ref", ctx.ref);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  return `/${lang}${path}?${params.toString()}`;
}
