import type {
  AgentInquiryView,
  Currency,
  Inquiry,
  Locale,
  PublicVehicle,
  Quote,
  SaleStatus,
  TradeMode,
  Transmission,
  Vehicle,
  VehicleClass,
} from "./types";
import { PAGE_SIZE } from "./types";

export function toPublic(vehicle: Vehicle): PublicVehicle {
  const rest: Vehicle = { ...vehicle };
  delete rest.internal;
  return rest;
}

export function toAgentInquiryView(inquiry: Inquiry): AgentInquiryView {
  return {
    id: inquiry.id,
    createdAt: inquiry.createdAt,
    status: inquiry.status,
    trade: inquiry.trade,
    vehicleId: inquiry.vehicleId,
    referralCode: inquiry.referralCode,
  };
}

export function textOf(
  pair: { ko: string; en: string } | null | undefined,
  lang: Locale,
  unknown: string,
): string {
  if (!pair) return unknown;
  const primary = pair[lang]?.trim();
  if (primary) return primary;
  const other = (lang === "ko" ? pair.en : pair.ko)?.trim();
  return other || unknown;
}

export function vehicleTitle(vehicle: PublicVehicle, lang: Locale): string {
  return [vehicle.manufacturer, vehicle.model, vehicle.trim]
    .map((part) => textOf(part, lang, ""))
    .filter(Boolean)
    .join(" ");
}

export function formatKrwKo(amount: number): string {
  if (!Number.isInteger(amount)) {
    return `${amount.toLocaleString("ko-KR")}원`;
  }
  if (amount % 10000 !== 0) return `${amount.toLocaleString("ko-KR")}원`;
  const eok = Math.floor(amount / 100_000_000);
  const man = Math.floor((amount % 100_000_000) / 10_000);
  const parts: string[] = [];
  if (eok) parts.push(`${eok.toLocaleString("ko-KR")}억`);
  if (man) parts.push(`${man.toLocaleString("ko-KR")}만`);
  if (!parts.length) return "0원";
  return `${parts.join(" ")}원`;
}

export function formatMoney(amount: number, currency: Currency, lang: Locale): string {
  if (currency === "KRW" && lang === "ko") return formatKrwKo(amount);
  const formatted = amount.toLocaleString(lang === "ko" ? "ko-KR" : "en-US");
  return `${currency} ${formatted}`;
}

export function activePrice(vehicle: PublicVehicle, trade: TradeMode) {
  if (trade === "domestic") return vehicle.domesticPrice;
  return vehicle.exportPrice;
}

export function isExportOffer(
  price: NonNullable<ReturnType<typeof activePrice>>,
): price is NonNullable<PublicVehicle["exportPrice"]> {
  return "terms" in price;
}

export type QuoteTotal =
  | { state: "complete"; total: number }
  | { state: "incomplete"; missing: string[] };

const QUOTE_LINES = [
  "vehiclePrice",
  "domesticTransport",
  "exportCosts",
  "oceanFreight",
  "otherCosts",
] as const;

export function quoteTotal(quote: Pick<Quote, (typeof QUOTE_LINES)[number]>): QuoteTotal {
  const missing = QUOTE_LINES.filter((key) => quote[key] === null);
  if (missing.length) return { state: "incomplete", missing: [...missing] };
  const total = QUOTE_LINES.reduce((sum, key) => sum + (quote[key] as number), 0);
  return { state: "complete", total };
}

export function assignAgent(
  inquiry: Inquiry,
  toAgentId: string | null,
  reason: string,
  at: string,
): Inquiry {
  return {
    ...inquiry,
    assignedAgentId: toAgentId,
    referralHistory: [
      ...inquiry.referralHistory,
      { at, fromAgentId: inquiry.assignedAgentId, toAgentId, reason },
    ],
  };
}

export type SortKey =
  | "newest"
  | "yearDesc"
  | "yearAsc"
  | "priceAsc"
  | "priceDesc"
  | "mileageAsc";

export type FilterInput = {
  maker?: string;
  model?: string;
  class?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  seatsMin?: number;
  seatsMax?: number;
  kmMin?: number;
  kmMax?: number;
  transmission?: string;
  fuel?: string;
  status?: string;
  q?: string;
  sort?: string;
  page?: number;
};

export type FilterOutput = {
  items: PublicVehicle[];
  total: number;
  page: number;
  pages: number;
  priceIgnored: boolean;
  sort: SortKey;
};

const SORTS: SortKey[] = [
  "newest",
  "yearDesc",
  "yearAsc",
  "priceAsc",
  "priceDesc",
  "mileageAsc",
];

function priceKey(vehicle: PublicVehicle, trade: TradeMode) {
  const price = activePrice(vehicle, trade);
  if (!price) return null;
  return { currency: price.currency, amount: price.amount };
}

export function compareByPrice(
  a: PublicVehicle,
  b: PublicVehicle,
  trade: TradeMode,
  direction: "asc" | "desc",
): number {
  const left = priceKey(a, trade);
  const right = priceKey(b, trade);
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  if (left.currency !== right.currency) return left.currency.localeCompare(right.currency);
  const diff = left.amount - right.amount;
  return direction === "asc" ? diff : -diff;
}

function compareNullLast(
  a: number | null,
  b: number | null,
  direction: "asc" | "desc",
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return direction === "asc" ? a - b : b - a;
}

export function filterVehicles(
  source: PublicVehicle[],
  trade: TradeMode,
  input: FilterInput,
): FilterOutput {
  let list = source.filter((vehicle) => vehicle.status !== "hidden");
  if (input.maker) list = list.filter((vehicle) => vehicle.manufacturerKey === input.maker);
  if (input.model) list = list.filter((vehicle) => vehicle.modelKey === input.model);
  if (input.class === "county" || input.class === "medium" || input.class === "large") {
    const klass = input.class as VehicleClass;
    list = list.filter((vehicle) => vehicle.class === klass);
  }
  if (input.yearMin != null) list = list.filter((vehicle) => vehicle.year >= input.yearMin!);
  if (input.yearMax != null) list = list.filter((vehicle) => vehicle.year <= input.yearMax!);
  if (
    input.transmission === "manual" ||
    input.transmission === "automatic" ||
    input.transmission === "unknown"
  ) {
    const transmission = input.transmission as Transmission;
    list = list.filter((vehicle) => vehicle.transmission === transmission);
  }
  if (input.fuel && input.fuel !== "all") {
    list = list.filter((vehicle) => vehicle.fuel === input.fuel);
  }
  if (
    input.status === "available" ||
    input.status === "reserved" ||
    input.status === "sold"
  ) {
    const status = input.status as SaleStatus;
    list = list.filter((vehicle) => vehicle.status === status);
  }
  if (input.seatsMin != null) {
    list = list.filter((vehicle) => vehicle.seats != null && vehicle.seats >= input.seatsMin!);
  }
  if (input.seatsMax != null) {
    list = list.filter((vehicle) => vehicle.seats != null && vehicle.seats <= input.seatsMax!);
  }
  if (input.kmMin != null) {
    list = list.filter(
      (vehicle) => vehicle.mileageKm != null && vehicle.mileageKm >= input.kmMin!,
    );
  }
  if (input.kmMax != null) {
    list = list.filter(
      (vehicle) => vehicle.mileageKm != null && vehicle.mileageKm <= input.kmMax!,
    );
  }

  let priceIgnored = false;
  if (input.priceMin != null || input.priceMax != null) {
    const currency = trade === "domestic" ? "KRW" : input.currency;
    if (trade === "export" && !currency) {
      priceIgnored = true;
    } else {
      list = list.filter((vehicle) => {
        const price = priceKey(vehicle, trade);
        if (!price || price.currency !== currency) return false;
        if (input.priceMin != null && price.amount < input.priceMin) return false;
        if (input.priceMax != null && price.amount > input.priceMax) return false;
        return true;
      });
    }
  }

  const keyword = input.q?.trim().toLowerCase();
  if (keyword) {
    list = list.filter((vehicle) => {
      const blob = [
        vehicle.id,
        vehicle.manufacturer.ko,
        vehicle.manufacturer.en,
        vehicle.model.ko,
        vehicle.model.en,
        vehicle.trim.ko,
        vehicle.trim.en,
        vehicle.description.ko,
        vehicle.description.en,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(keyword);
    });
  }

  const sort: SortKey = SORTS.includes(input.sort as SortKey) ? (input.sort as SortKey) : "newest";
  const sorted = [...list].sort((a, b) => {
    if (sort === "yearAsc") return a.year - b.year;
    if (sort === "yearDesc") return b.year - a.year;
    if (sort === "mileageAsc") return compareNullLast(a.mileageKm, b.mileageKm, "asc");
    if (sort === "priceAsc") return compareByPrice(a, b, trade, "asc");
    if (sort === "priceDesc") return compareByPrice(a, b, trade, "desc");
    return b.createdAt.localeCompare(a.createdAt);
  });

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const requested = input.page && input.page > 0 ? input.page : 1;
  const page = Math.min(requested, pages);
  const start = (page - 1) * PAGE_SIZE;
  return {
    items: sorted.slice(start, start + PAGE_SIZE),
    total: sorted.length,
    page,
    pages,
    priceIgnored,
    sort,
  };
}

export function parseFilterParams(
  params: Record<string, string | string[] | undefined>,
): FilterInput {
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const num = (key: string) => {
    const value = one(key)?.trim();
    if (!value || !/^\d+(\.\d+)?$/.test(value)) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  return {
    maker: one("maker") || undefined,
    model: one("model") || undefined,
    class: one("class") || undefined,
    yearMin: num("yearMin"),
    yearMax: num("yearMax"),
    priceMin: num("priceMin"),
    priceMax: num("priceMax"),
    currency: one("currency") || undefined,
    seatsMin: num("seatsMin"),
    seatsMax: num("seatsMax"),
    kmMin: num("kmMin"),
    kmMax: num("kmMax"),
    transmission: one("transmission") || undefined,
    fuel: one("fuel") || undefined,
    status: one("status") || undefined,
    q: one("q") || undefined,
    sort: one("sort") || undefined,
    page: num("page"),
  };
}

export function countByClass(vehicles: PublicVehicle[], klass: VehicleClass) {
  return vehicles.filter((vehicle) => vehicle.class === klass && vehicle.status === "available")
    .length;
}

export function whatsappLink(phone: string, text: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function phoneLink(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `tel:${digits}`;
}

export function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function whatsappText(stockNo: string, referral: string | null): string {
  return referral ? `K-BUS HUB ${stockNo} ref ${referral}` : `K-BUS HUB ${stockNo}`;
}
