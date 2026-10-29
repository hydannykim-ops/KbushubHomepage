import type { Lang, PublicVehicle, Quote, QuoteLineKey, TradeMode, VehicleInternal } from "./types";
import { contentFieldLang, localeTag } from "../i18n/langs";
import { copy } from "../i18n";

const unknownText = (lang: Lang) => copy(lang).unknown;

export function unknownLabel(lang: Lang): string {
  return unknownText(lang);
}

export function showText(value: string | null | undefined, lang: Lang): string {
  if (value == null || value.trim() === "") return unknownText(lang);
  return value;
}

export function formatMoney(amount: number, currency: string, lang: Lang): string {
  const locale = localeTag(lang);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "KRW" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${currency}`;
  }
}

export function formatKm(km: number | null, lang: Lang): string {
  if (km == null) return unknownText(lang);
  const locale = localeTag(lang);
  return `${km.toLocaleString(locale)} km`;
}

export type PriceView = {
  primary: string;
  basis: string | null;
  ask: boolean;
};

const askPrice: Record<Lang, string> = {
  ko: "가격 문의",
  en: "Ask for price",
  es: "Consultar precio",
  fr: "Prix sur demande",
  km: "សួរតម្លៃ",
  mn: "Үнэ асуух",
};

const domesticBasis: Record<Lang, string> = {
  ko: "국내 판매가",
  en: "Domestic price",
  es: "Precio nacional",
  fr: "Prix national",
  km: "តម្លៃក្នុងស្រុក",
  mn: "Дотоод үнэ",
};

function askPrimary(lang: Lang, listedBy?: string | null): string {
  const label = askPrice[lang];
  const company = listedBy?.trim();
  return company ? `${label} · ${company}` : label;
}

export function priceView(vehicle: PublicVehicle, mode: TradeMode, lang: Lang, listedBy?: string | null): PriceView {
  if (mode === "domestic") {
    if (vehicle.domesticPriceKrw == null) {
      return { primary: askPrimary(lang, listedBy), basis: null, ask: true };
    }
    return {
      primary: formatMoney(vehicle.domesticPriceKrw, "KRW", lang),
      basis: domesticBasis[lang],
      ask: false,
    };
  }
  if (vehicle.exportPriceAmount == null || !vehicle.exportPriceCurrency) {
    return { primary: askPrimary(lang, listedBy), basis: null, ask: true };
  }
  const field = contentFieldLang(lang);
  const terms = field === "ko" ? vehicle.exportPriceTermsKo : vehicle.exportPriceTermsEn;
  return {
    primary: formatMoney(vehicle.exportPriceAmount, vehicle.exportPriceCurrency, lang),
    basis: terms?.trim()
      ? terms
      : lang === "ko"
        ? `${vehicle.exportPriceCurrency} 수출 가격`
        : `${vehicle.exportPriceCurrency} export price`,
    ask: false,
  };
}

export function internalProfit(internal: VehicleInternal):
  | { status: "amount"; amount: number; currency: string }
  | { status: "unknown"; reason: "missing" | "currency" } {
  const amounts = [internal.purchaseCost, internal.actualSaleAmount, internal.extraCosts, internal.agentFee];
  if (amounts.some((value) => value == null || !Number.isFinite(value))) {
    return { status: "unknown", reason: "missing" };
  }
  const currencies = [internal.purchaseCurrency, internal.saleCurrency, internal.feeCurrency];
  if (currencies.some((value) => !value)) return { status: "unknown", reason: "currency" };
  const unique = new Set(currencies);
  if (unique.size !== 1) return { status: "unknown", reason: "currency" };
  const currency = currencies[0] as string;
  const amount =
    (internal.actualSaleAmount as number) -
    (internal.purchaseCost as number) -
    (internal.extraCosts as number) -
    (internal.agentFee as number);
  return { status: "amount", amount, currency };
}

export type QuoteSummary = {
  currency: string;
  confirmed: boolean;
  total: number | null;
  knownSubtotal: number;
  unknownKeys: QuoteLineKey[];
  zeroKeys: QuoteLineKey[];
};

export function summarizeQuote(quote: Pick<Quote, "currency" | "lines">): QuoteSummary {
  const unknownKeys: QuoteLineKey[] = [];
  const zeroKeys: QuoteLineKey[] = [];
  let knownSubtotal = 0;
  for (const key of quoteLineKeys) {
    const line = quote.lines[key];
    if (!line || line.status === "unknown") {
      unknownKeys.push(key);
      continue;
    }
    if (line.status === "zero") {
      zeroKeys.push(key);
      continue;
    }
    knownSubtotal += line.amount ?? 0;
  }
  if (unknownKeys.length > 0) {
    return { currency: quote.currency, confirmed: false, total: null, knownSubtotal, unknownKeys, zeroKeys };
  }
  return {
    currency: quote.currency,
    confirmed: true,
    total: knownSubtotal,
    knownSubtotal,
    unknownKeys,
    zeroKeys,
  };
}

export const quoteLineKeys = [
  "vehiclePrice",
  "domesticTransport",
  "exportCosts",
  "oceanFreight",
  "otherCosts",
] as const satisfies readonly QuoteLineKey[];
