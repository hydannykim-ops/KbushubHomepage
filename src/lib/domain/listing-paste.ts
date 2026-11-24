import { standardForModel } from "./model-specs";
import type { Fuel, Steering, Transmission, VehicleClass } from "./types";
import { busMakers, busModelsByMaker, classForModel, makerForModel, type BusMaker } from "./vehicle-catalog";

export type ListingPasteDraft = {
  maker: string;
  model: string;
  vehicleClass: VehicleClass;
  modelYear: number | null;
  modelMonth: number | null;
  mileageKm: number | null;
  previousUseKo: string | null;
  phone: string | null;
  descriptionKo: string | null;
  seats: number | null;
  horsepowerPs: number | null;
  transmission: Transmission;
  fuel: Fuel;
  engineModel: string | null;
  displacementCc: number | null;
  steering: Steering;
  longBody: boolean | null;
  warnings: string[];
};

function normalize(value: string) {
  return value
    .replace(/[●•·▪︎]/g, " ")
    .replace(/[：:]/g, ":")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLabel(line: string, labels: string[]) {
  const lower = line.toLowerCase();
  for (const label of labels) {
    const idx = lower.indexOf(label.toLowerCase());
    if (idx < 0) continue;
    let rest = line.slice(idx + label.length).trim();
    rest = rest.replace(/^[:：=\-\s]+/, "").trim();
    return rest;
  }
  return null;
}

function parseYearMonth(raw: string): { year: number | null; month: number | null } {
  const text = raw.replace(/\s+/g, "");
  const full = text.match(/(20\d{2}|19\d{2})\s*년?(?:\s*(\d{1,2})\s*월)?/);
  if (full) {
    const year = Number(full[1]);
    const month = full[2] ? Number(full[2]) : null;
    return { year, month: month && month >= 1 && month <= 12 ? month : null };
  }
  const short = text.match(/(\d{2})\s*년(?:식)?(?:\s*(\d{1,2})\s*월)?/);
  if (short) {
    const yy = Number(short[1]);
    const year = yy >= 70 ? 1900 + yy : 2000 + yy;
    const month = short[2] ? Number(short[2]) : null;
    return { year, month: month && month >= 1 && month <= 12 ? month : null };
  }
  return { year: null, month: null };
}

function parseMileage(raw: string): number | null {
  const digits = raw.replace(/,/g, "").match(/(\d{3,7})\s*(km|킬로|키로)?/i);
  if (!digits) return null;
  const value = Number(digits[1]);
  return Number.isFinite(value) ? value : null;
}

function parsePhone(raw: string): string | null {
  const match = raw.match(/01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}/);
  return match ? match[0].replace(/[.\s]/g, "-") : null;
}

/** Prefer longer catalog model names so "유니버스 노블" wins over "유니버스". */
function modelNeedles(model: string): string[] {
  const compact = model.replace(/\s+/g, "");
  return compact.startsWith("뉴") ? [compact, compact.slice(1)] : [compact];
}

function allCatalogModels(): string[] {
  const models = new Set<string>();
  for (const maker of busMakers) {
    for (const model of busModelsByMaker[maker]) {
      if (model !== "기타") models.add(model);
    }
  }
  return [...models].sort((a, b) => b.length - a.length);
}

export function matchCatalogModel(raw: string): { maker: BusMaker | ""; model: string } {
  let text = normalize(raw).replace(/현대자동차|현대차/g, "현대");
  for (const maker of busMakers) {
    if (text.startsWith(maker)) {
      text = text.slice(maker.length).trim();
      break;
    }
  }
  const compact = text.replace(/\s+/g, "");
  for (const model of allCatalogModels()) {
    if (text === model || modelNeedles(model).includes(compact)) {
      return { maker: makerForModel(model), model };
    }
  }
  for (const model of allCatalogModels()) {
    if (text.includes(model) || modelNeedles(model).some((needle) => compact.includes(needle))) {
      return { maker: makerForModel(model), model };
    }
  }
  return { maker: "", model: "" };
}

export function parseListingPaste(source: string): ListingPasteDraft {
  const warnings: string[] = [];
  const lines = source
    .split(/\r?\n/)
    .map((line) => normalize(line))
    .filter(Boolean);

  let nameRaw = "";
  let yearRaw = "";
  let mileageRaw = "";
  let useRaw = "";
  let phone: string | null = null;
  const leftovers: string[] = [];

  for (const line of lines) {
    const name = stripLabel(line, ["차명", "모델", "차종", "차량"]);
    if (name != null && !nameRaw) {
      nameRaw = name;
      continue;
    }
    const year = stripLabel(line, ["년식", "연식", "년도", "연도"]);
    if (year != null && !yearRaw) {
      yearRaw = year;
      continue;
    }
    const mileage = stripLabel(line, ["거리", "주행거리", "주행", "키로수", "킬로수"]);
    if (mileage != null && !mileageRaw) {
      mileageRaw = mileage;
      continue;
    }
    const use = stripLabel(line, ["기타", "용도", "기존용도", "사용용도"]);
    if (use != null && !useRaw) {
      useRaw = use;
      continue;
    }
    const foundPhone = parsePhone(line);
    if (foundPhone && !phone) {
      phone = foundPhone;
      const rest = line.replace(foundPhone, "").replace(/전화문의\s*바랍니다\.?/g, "").trim();
      if (rest && !useRaw) leftovers.push(rest);
      continue;
    }
    leftovers.push(line);
  }

  if (!nameRaw && leftovers[0]) nameRaw = leftovers.shift() ?? "";

  const matched = matchCatalogModel(nameRaw || source);
  const { year, month } = yearRaw ? parseYearMonth(yearRaw) : parseYearMonth(source);
  const mileageKm = mileageRaw ? parseMileage(mileageRaw) : parseMileage(source);
  if (!phone) phone = parsePhone(source);

  if (!matched.model) warnings.push("차명을 카탈로그 모델과 맞추지 못했습니다. 아래에서 제조사·모델을 선택해 주세요.");
  if (year == null) warnings.push("연식을 읽지 못했습니다.");
  if (mileageKm == null) warnings.push("주행거리를 읽지 못했습니다.");

  const standard = matched.model ? standardForModel(matched.model) : null;
  const vehicleClass = (matched.model && classForModel(matched.model)) || "large";

  const descriptionParts = [
    nameRaw ? `차명: ${nameRaw}` : null,
    yearRaw ? `년식: ${yearRaw}` : null,
    mileageRaw ? `거리: ${mileageRaw}` : null,
    useRaw ? `기타: ${useRaw}` : null,
    phone ? `전화문의 ${phone}` : null,
    leftovers.length ? leftovers.join("\n") : null,
  ].filter(Boolean);

  return {
    maker: matched.maker,
    model: matched.model,
    vehicleClass,
    modelYear: year,
    modelMonth: month,
    mileageKm,
    previousUseKo: useRaw || null,
    phone,
    descriptionKo: descriptionParts.join("\n") || null,
    seats: standard?.seats ?? null,
    horsepowerPs: standard?.horsepowerPs ?? null,
    transmission: standard?.transmission ?? "unknown",
    fuel: standard?.fuel ?? "unknown",
    engineModel: standard?.engineModel ?? null,
    displacementCc: standard?.displacementCc ?? null,
    steering: standard?.steering ?? "unknown",
    longBody: standard?.longBody ?? null,
    warnings,
  };
}

export function suggestAdminStockNo(modelYear: number | null): string {
  const yy = modelYear ? String(modelYear).slice(-2) : new Date().getFullYear().toString().slice(-2);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KB${yy}-${rand}`;
}
