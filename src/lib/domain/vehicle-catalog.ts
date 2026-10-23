/** Korean bus makers and models used for selection UI (MyBus-style lists). */

import type { Lang, VehicleClass } from "./types";

export const busMakers = ["현대", "기아", "대우", "벤츠", "선롱버스", "수입버스", "기타"] as const;

export type BusMaker = (typeof busMakers)[number];

export const busModelsByMaker: Record<BusMaker, readonly string[]> = {
  현대: [
    "카운티",
    "카운티 롱바디",
    "쏠라티",
    "에어로타운",
    "에어로타운 롱바디",
    "에어로시티",
    "유니시티",
    "글로벌900",
    "유니버스",
    "유니버스 노블",
    "유니버스 노블EX",
    "유니버스 프라임",
    "유니버스 프라임EX",
    "유니버스 럭셔리",
    "일렉시티",
    "기타",
  ],
  기아: [
    "그랜버드",
    "뉴그랜버드 실크로드",
    "뉴그랜버드 파크웨이",
    "뉴그랜버드 썬샤인",
    "레스타",
    "기타",
  ],
  대우: ["BH090", "BS106", "BX212", "FX", "스페이스콤비", "로얄시티", "기타"],
  벤츠: ["스프린터", "투리스모", "트라베고", "기타"],
  선롱버스: ["슬로프", "시티", "코치", "기타"],
  수입버스: ["볼보", "스카니아", "만", "이베코", "기타"],
  기타: ["기타"],
};

/**
 * Series/family for models that share a line (MyBus-style: maker → series → trim).
 * Models without siblings treat themselves as their own series.
 */
const modelSeries: Record<string, string> = {
  카운티: "카운티",
  "카운티 롱바디": "카운티",
  쏠라티: "쏠라티",
  에어로타운: "에어로타운",
  "에어로타운 롱바디": "에어로타운",
  에어로시티: "에어로시티",
  유니시티: "유니시티",
  글로벌900: "글로벌900",
  유니버스: "유니버스",
  "유니버스 노블": "유니버스",
  "유니버스 노블EX": "유니버스",
  "유니버스 프라임": "유니버스",
  "유니버스 프라임EX": "유니버스",
  "유니버스 럭셔리": "유니버스",
  일렉시티: "일렉시티",
  그랜버드: "그랜버드",
  "뉴그랜버드 실크로드": "그랜버드",
  "뉴그랜버드 파크웨이": "그랜버드",
  "뉴그랜버드 썬샤인": "그랜버드",
  레스타: "레스타",
  BH090: "BH090",
  BS106: "BS106",
  BX212: "BX212",
  FX: "FX",
  스페이스콤비: "스페이스콤비",
  로얄시티: "로얄시티",
  스프린터: "스프린터",
  투리스모: "투리스모",
  트라베고: "트라베고",
  슬로프: "슬로프",
  시티: "시티",
  코치: "코치",
  볼보: "볼보",
  스카니아: "스카니아",
  만: "만",
  이베코: "이베코",
  기타: "기타",
};

/** Fixed class for each catalog model so browse filters stay coherent. */
const modelVehicleClass: Record<string, VehicleClass> = {
  카운티: "county",
  "카운티 롱바디": "county",
  쏠라티: "county",
  레스타: "county",
  에어로타운: "medium",
  "에어로타운 롱바디": "medium",
  에어로시티: "medium",
  유니시티: "medium",
  글로벌900: "medium",
  BH090: "medium",
  BS106: "medium",
  스페이스콤비: "medium",
  스프린터: "medium",
  슬로프: "medium",
  시티: "medium",
  유니버스: "large",
  "유니버스 노블": "large",
  "유니버스 노블EX": "large",
  "유니버스 프라임": "large",
  "유니버스 프라임EX": "large",
  "유니버스 럭셔리": "large",
  일렉시티: "large",
  그랜버드: "large",
  "뉴그랜버드 실크로드": "large",
  "뉴그랜버드 파크웨이": "large",
  "뉴그랜버드 썬샤인": "large",
  BX212: "large",
  FX: "large",
  로얄시티: "large",
  투리스모: "large",
  트라베고: "large",
  코치: "large",
  볼보: "large",
  스카니아: "large",
  만: "large",
  이베코: "large",
};

const makerEn: Record<BusMaker, string> = {
  현대: "Hyundai",
  기아: "Kia",
  대우: "Daewoo",
  벤츠: "Mercedes-Benz",
  선롱버스: "Sunlong",
  수입버스: "Import",
  기타: "Other",
};

/** Latin / common export names for catalog models. Stored values stay Korean. */
const modelEn: Record<string, string> = {
  카운티: "County",
  "카운티 롱바디": "County Long Body",
  쏠라티: "Solati",
  에어로타운: "Aero Town",
  "에어로타운 롱바디": "Aero Town Long Body",
  에어로시티: "Aero City",
  유니시티: "Universe City",
  글로벌900: "Global 900",
  유니버스: "Universe",
  "유니버스 노블": "Universe Noble",
  "유니버스 노블EX": "Universe Noble EX",
  "유니버스 프라임": "Universe Prime",
  "유니버스 프라임EX": "Universe Prime EX",
  "유니버스 럭셔리": "Universe Luxury",
  일렉시티: "Elec City",
  그랜버드: "Granbird",
  "뉴그랜버드 실크로드": "New Granbird Silk Road",
  "뉴그랜버드 파크웨이": "New Granbird Parkway",
  "뉴그랜버드 썬샤인": "New Granbird Sunshine",
  레스타: "Lesta",
  BH090: "BH090",
  BS106: "BS106",
  BX212: "BX212",
  FX: "FX",
  스페이스콤비: "Space Combi",
  로얄시티: "Royal City",
  스프린터: "Sprinter",
  투리스모: "Tourismo",
  트라베고: "Travego",
  슬로프: "Slope",
  시티: "City",
  코치: "Coach",
  볼보: "Volvo",
  스카니아: "Scania",
  만: "MAN",
  이베코: "Iveco",
  기타: "Other",
};

const seriesEn: Record<string, string> = {
  카운티: "County",
  쏠라티: "Solati",
  에어로타운: "Aero Town",
  에어로시티: "Aero City",
  유니시티: "Universe City",
  글로벌900: "Global 900",
  유니버스: "Universe",
  일렉시티: "Elec City",
  그랜버드: "Granbird",
  레스타: "Lesta",
  BH090: "BH090",
  BS106: "BS106",
  BX212: "BX212",
  FX: "FX",
  스페이스콤비: "Space Combi",
  로얄시티: "Royal City",
  스프린터: "Sprinter",
  투리스모: "Tourismo",
  트라베고: "Travego",
  슬로프: "Slope",
  시티: "City",
  코치: "Coach",
  볼보: "Volvo",
  스카니아: "Scania",
  만: "MAN",
  이베코: "Iveco",
  기타: "Other",
};

export function isBusMaker(value: string): value is BusMaker {
  return (busMakers as readonly string[]).includes(value);
}

export function classForModel(model: string): VehicleClass | null {
  return modelVehicleClass[model] ?? null;
}

export function modelsForMaker(maker: string, vehicleClass: VehicleClass | "" = ""): readonly string[] {
  if (!isBusMaker(maker)) return [];
  const all = busModelsByMaker[maker];
  if (!vehicleClass) return all;
  return all.filter((model) => model === "기타" || classForModel(model) === vehicleClass);
}

export function makersForClass(vehicleClass: VehicleClass | "" = ""): readonly BusMaker[] {
  if (!vehicleClass) return busMakers;
  return busMakers.filter((maker) => modelsForMaker(maker, vehicleClass).some((model) => model !== "기타" || busModelsByMaker[maker].length === 1));
}

export function makerLabel(maker: string, lang: Lang): string {
  if (!isBusMaker(maker)) return maker;
  return lang === "ko" ? maker : makerEn[maker];
}

export function modelLabel(model: string, lang: Lang): string {
  if (lang === "ko") return model;
  return modelEn[model] ?? model;
}

export function seriesLabel(series: string, lang: Lang): string {
  if (lang === "ko") return series;
  return seriesEn[series] ?? modelEn[series] ?? series;
}

/** Public listing title: localized maker + model (+ optional trim as stored). */
export function vehicleTitle(
  vehicle: { maker: string; model: string; trim?: string | null },
  lang: Lang,
  options?: { includeTrim?: boolean },
): string {
  const base = `${makerLabel(vehicle.maker, lang)} ${modelLabel(vehicle.model, lang)}`.trim();
  if (options?.includeTrim === false || !vehicle.trim) return base;
  return `${base} ${vehicle.trim}`.trim();
}

export function knownMakerModel(maker: string, model: string, vehicleClass: VehicleClass | "" = ""): boolean {
  if (!isBusMaker(maker)) return false;
  return modelsForMaker(maker, vehicleClass).includes(model);
}

export function makerForModel(model: string): BusMaker | "" {
  for (const maker of busMakers) {
    if (busModelsByMaker[maker].includes(model)) return maker;
  }
  return "";
}

export function seriesForModel(model: string): string {
  return modelSeries[model] ?? model;
}

export function modelsForSeries(maker: string, series: string, vehicleClass: VehicleClass | "" = ""): readonly string[] {
  return modelsForMaker(maker, vehicleClass).filter((model) => seriesForModel(model) === series);
}

/** Unique series names for a maker, preserving catalog order. */
export function seriesForMaker(maker: string, vehicleClass: VehicleClass | "" = ""): readonly string[] {
  const seen = new Set<string>();
  const series: string[] = [];
  for (const model of modelsForMaker(maker, vehicleClass)) {
    const name = seriesForModel(model);
    if (seen.has(name)) continue;
    seen.add(name);
    series.push(name);
  }
  return series;
}

export function seriesHasVariants(maker: string, series: string, vehicleClass: VehicleClass | "" = ""): boolean {
  return modelsForSeries(maker, series, vehicleClass).length > 1;
}
