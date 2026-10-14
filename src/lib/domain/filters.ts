import { toPublicVehicle } from "./access";
import type { AdminVehicle, PublicVehicle, SaleStatus, SortKey, TradeMode, VehicleQuery } from "./types";

const statuses = new Set<SaleStatus>(["available", "reserved", "sold", "hidden"]);
const classes = new Set(["county", "medium", "large"]);
const transmissions = new Set(["manual", "automatic", "unknown"]);
const fuels = new Set(["diesel", "gasoline", "lpg", "cng", "electric", "hybrid", "unknown"]);
const sorts = new Set<SortKey>(["newest", "year_desc", "year_asc", "price_asc", "price_desc", "mileage_asc"]);

function num(value: string | null): number | null {
  if (value == null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseVehicleQuery(params: URLSearchParams): VehicleQuery {
  const vehicleClass = params.get("class") ?? "";
  const transmission = params.get("transmission") ?? "";
  const fuel = params.get("fuel") ?? "";
  const status = params.get("status") ?? "";
  const sort = params.get("sort") ?? "";
  return {
    q: params.get("q")?.trim() || undefined,
    maker: params.get("maker")?.trim() || undefined,
    model: params.get("model")?.trim() || undefined,
    vehicleClass: classes.has(vehicleClass) ? (vehicleClass as VehicleQuery["vehicleClass"]) : "",
    yearMin: num(params.get("yearMin")),
    yearMax: num(params.get("yearMax")),
    priceMin: num(params.get("priceMin")),
    priceMax: num(params.get("priceMax")),
    priceCurrency: params.get("priceCurrency")?.trim().toUpperCase() || null,
    seatsMin: num(params.get("seatsMin")),
    mileageMax: num(params.get("mileageMax")),
    transmission: transmissions.has(transmission) ? (transmission as VehicleQuery["transmission"]) : "",
    fuel: fuels.has(fuel) ? (fuel as VehicleQuery["fuel"]) : "",
    status: statuses.has(status as SaleStatus) ? (status as SaleStatus) : "",
    sort: sorts.has(sort as SortKey) ? (sort as SortKey) : "newest",
  };
}

export function serializeVehicleQuery(
  query: VehicleQuery,
  extra?: Record<string, string | null | undefined>,
): string {
  const params = new URLSearchParams();
  const set = (key: string, value: string | number | null | undefined) => {
    if (value == null || value === "") return;
    params.set(key, String(value));
  };
  set("q", query.q);
  set("maker", query.maker);
  set("model", query.model);
  set("class", query.vehicleClass);
  set("yearMin", query.yearMin);
  set("yearMax", query.yearMax);
  set("priceMin", query.priceMin);
  set("priceMax", query.priceMax);
  set("priceCurrency", query.priceCurrency);
  set("seatsMin", query.seatsMin);
  set("mileageMax", query.mileageMax);
  set("transmission", query.transmission);
  set("fuel", query.fuel);
  set("status", query.status);
  if (query.sort && query.sort !== "newest") set("sort", query.sort);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) set(key, value);
  }
  return params.toString();
}

function includesText(haystack: string, needle: string): boolean {
  return haystack.toLocaleLowerCase().includes(needle.toLocaleLowerCase());
}

function priceParts(vehicle: PublicVehicle, mode: TradeMode): { missing: boolean; currency: string; amount: number } {
  if (mode === "domestic") {
    if (vehicle.domesticPriceKrw == null) return { missing: true, currency: "", amount: 0 };
    return { missing: false, currency: "KRW", amount: vehicle.domesticPriceKrw };
  }
  if (vehicle.exportPriceAmount == null || !vehicle.exportPriceCurrency) {
    return { missing: true, currency: "", amount: 0 };
  }
  return { missing: false, currency: vehicle.exportPriceCurrency, amount: vehicle.exportPriceAmount };
}

export type FilterResult = {
  items: PublicVehicle[];
  ignoredPriceFilter: boolean;
};

export function filterVehicles(
  vehicles: Array<PublicVehicle | AdminVehicle>,
  query: VehicleQuery,
  mode: TradeMode,
): FilterResult {
  let ignoredPriceFilter = false;
  const priced = vehicles.flatMap((vehicle) => {
    if ("internal" in vehicle) {
      const pub = toPublicVehicle(vehicle);
      return pub ? [pub] : [];
    }
    return [vehicle];
  });
  let rows = priced.filter((vehicle) => {
    if (query.q) {
      const blob = [vehicle.stockNo, vehicle.maker, vehicle.model, vehicle.trim ?? ""].join(" ");
      if (!includesText(blob, query.q)) return false;
    }
    if (query.maker && !includesText(vehicle.maker, query.maker)) return false;
    if (query.model && !includesText(`${vehicle.model} ${vehicle.trim ?? ""}`, query.model)) return false;
    if (query.vehicleClass && vehicle.vehicleClass !== query.vehicleClass) return false;
    if (query.yearMin != null && (vehicle.modelYear == null || vehicle.modelYear < query.yearMin)) return false;
    if (query.yearMax != null && (vehicle.modelYear == null || vehicle.modelYear > query.yearMax)) return false;
    if (query.seatsMin != null && (vehicle.seats == null || vehicle.seats < query.seatsMin)) return false;
    if (query.mileageMax != null && (vehicle.mileageKm == null || vehicle.mileageKm > query.mileageMax)) return false;
    if (query.transmission && vehicle.transmission !== query.transmission) return false;
    if (query.fuel && vehicle.fuel !== query.fuel) return false;
    if (query.status === "hidden") return false;
    if (query.status && vehicle.status !== query.status) return false;
    return true;
  });

  const hasPriceFilter = query.priceMin != null || query.priceMax != null;
  if (hasPriceFilter) {
    if (mode === "export" && !query.priceCurrency) {
      ignoredPriceFilter = true;
    } else {
      rows = rows.filter((vehicle) => {
        const price = priceParts(vehicle, mode);
        if (price.missing) return false;
        if (mode === "export" && price.currency !== query.priceCurrency) return false;
        if (query.priceMin != null && price.amount < query.priceMin) return false;
        if (query.priceMax != null && price.amount > query.priceMax) return false;
        return true;
      });
    }
  }

  const sort = query.sort ?? "newest";
  rows.sort((a, b) => compareVehicles(a, b, sort, mode));
  return { items: rows, ignoredPriceFilter };
}

function compareVehicles(a: PublicVehicle, b: PublicVehicle, sort: SortKey, mode: TradeMode): number {
  if (sort === "newest") return b.createdAt.localeCompare(a.createdAt) || a.stockNo.localeCompare(b.stockNo);
  if (sort === "year_desc" || sort === "year_asc") {
    const dir = sort === "year_desc" ? -1 : 1;
    if (a.modelYear == null && b.modelYear == null) return a.stockNo.localeCompare(b.stockNo);
    if (a.modelYear == null) return 1;
    if (b.modelYear == null) return -1;
    return (a.modelYear - b.modelYear) * dir || a.stockNo.localeCompare(b.stockNo);
  }
  if (sort === "mileage_asc") {
    if (a.mileageKm == null && b.mileageKm == null) return a.stockNo.localeCompare(b.stockNo);
    if (a.mileageKm == null) return 1;
    if (b.mileageKm == null) return -1;
    return a.mileageKm - b.mileageKm || a.stockNo.localeCompare(b.stockNo);
  }
  const pa = priceParts(a, mode);
  const pb = priceParts(b, mode);
  if (pa.missing && pb.missing) return a.stockNo.localeCompare(b.stockNo);
  if (pa.missing) return 1;
  if (pb.missing) return -1;
  const currencyOrder = pa.currency.localeCompare(pb.currency);
  if (currencyOrder !== 0) return currencyOrder;
  const dir = sort === "price_desc" ? -1 : 1;
  return (pa.amount - pb.amount) * dir || a.stockNo.localeCompare(b.stockNo);
}

export function sameInventoryStatus(vehicles: AdminVehicle[], stockNo: string): SaleStatus | null {
  const found = vehicles.find((vehicle) => vehicle.stockNo === stockNo);
  return found?.status ?? null;
}
