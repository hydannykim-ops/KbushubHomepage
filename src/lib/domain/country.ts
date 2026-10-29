/** Country/nationality helpers for signup and inquiry routing. */

const koreaAliases = new Set(
  ["한국", "대한민국", "korea", "south korea", "republic of korea", "kr", "kor"].map((value) => value.toLowerCase()),
);

export function normalizeCountry(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed.slice(0, 80) : null;
}

export function isKoreaCountry(value: string | null | undefined): boolean {
  const normalized = normalizeCountry(value)?.toLowerCase();
  if (!normalized) return true;
  return koreaAliases.has(normalized);
}

/** Foreign members open export (quote) inquiries; Korea defaults to domestic purchase. */
export function inquiryTradeModeForCountry(value: string | null | undefined): "domestic" | "export" {
  return isKoreaCountry(value) ? "domestic" : "export";
}
