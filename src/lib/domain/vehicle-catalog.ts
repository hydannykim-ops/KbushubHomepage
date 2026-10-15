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
