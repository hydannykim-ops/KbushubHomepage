import type { Lang } from "./types";

const CODE = /^[A-Z0-9]{4,16}$/;

export function normalizeReferralCode(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim().toUpperCase();
  return CODE.test(value) ? value : null;
}

export function rememberReferral(existingFirst: string | null, incoming: string | null): { first: string | null; latest: string | null } {
  const first = normalizeReferralCode(existingFirst) ?? normalizeReferralCode(incoming);
  const latest = normalizeReferralCode(incoming) ?? normalizeReferralCode(existingFirst);
  return { first, latest };
}

export function referralForInquiry(first: string | null | undefined, latest: string | null | undefined): {
  firstReferralCode: string | null;
  submitReferralCode: string | null;
} {
  const normalizedFirst = normalizeReferralCode(first);
  const normalizedLatest = normalizeReferralCode(latest) ?? normalizedFirst;
  return { firstReferralCode: normalizedFirst, submitReferralCode: normalizedLatest };
}

export function generateReferralCode(randomByte: () => number = () => Math.floor(Math.random() * 256)): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  while (code.length < 8) {
    code += alphabet[randomByte() % alphabet.length];
  }
  return code;
}

export function whatsappMessage(input: {
  lang: Lang;
  stockNo: string;
  referralCode: string | null;
  mode?: "domestic" | "export";
}): string {
  if (input.lang === "ko") {
    const kind = input.mode === "export" ? "수출 문의" : "문의";
    return `K-BUS HUB ${kind}\n매물번호: ${input.stockNo}\n추천코드: ${input.referralCode ?? "없음"}`;
  }
  const kind = input.mode === "export" ? "export inquiry" : "inquiry";
  return `K-BUS HUB ${kind}\nStock no: ${input.stockNo}\nReferral code: ${input.referralCode ?? "none"}`;
}

export function whatsappHref(e164: string, message: string): string | null {
  if (!/^[1-9][0-9]{7,14}$/.test(e164)) return null;
  return `https://wa.me/${e164}?text=${encodeURIComponent(message)}`;
}
