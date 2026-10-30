import type { Lang } from "./types";

export type YearMonth = { year: number | null; month: number | null };

/** Accepts 2020, 2020/03, 2020-03, 2020.03 */
export function parseModelYearMonth(raw: unknown): { ok: true; value: YearMonth } | { ok: false } {
  if (raw == null || raw === "") return { ok: true, value: { year: null, month: null } };
  if (typeof raw === "number") {
    if (!Number.isInteger(raw) || raw < 1980 || raw > 2035) return { ok: false };
    return { ok: true, value: { year: raw, month: null } };
  }
  const text = String(raw).trim().replace(/\s+/g, "");
  if (!text) return { ok: true, value: { year: null, month: null } };

  const withMonth = /^(\d{4})[/\-.](\d{1,2})$/.exec(text);
  if (withMonth) {
    const year = Number(withMonth[1]);
    const month = Number(withMonth[2]);
    if (!Number.isInteger(year) || year < 1980 || year > 2035) return { ok: false };
    if (!Number.isInteger(month) || month < 1 || month > 12) return { ok: false };
    return { ok: true, value: { year, month } };
  }

  const yearOnly = /^(\d{4})$/.exec(text);
  if (yearOnly) {
    const year = Number(yearOnly[1]);
    if (!Number.isInteger(year) || year < 1980 || year > 2035) return { ok: false };
    return { ok: true, value: { year, month: null } };
  }

  return { ok: false };
}

export function formatModelYearMonth(year: number | null | undefined, month: number | null | undefined, lang: Lang, unknownLabel: string): string {
  if (year == null) return unknownLabel;
  if (month != null && month >= 1 && month <= 12) {
    const mm = String(month).padStart(2, "0");
    return `${year}/${mm}`;
  }
  return lang === "ko" ? `${year}년` : String(year);
}

export function modelYearMonthInputValue(year: number | null | undefined, month: number | null | undefined): string {
  if (year == null) return "";
  if (month != null && month >= 1 && month <= 12) return `${year}/${String(month).padStart(2, "0")}`;
  return String(year);
}
