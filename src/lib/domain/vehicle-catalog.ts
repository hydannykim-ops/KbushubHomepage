/** Korean bus makers and models used for selection UI (MyBus-style lists). */

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

export function modelsForMaker(maker: string): readonly string[] {
  if (!isBusMaker(maker)) return [];
  return busModelsByMaker[maker];
}

export function makerLabel(maker: string, lang: "ko" | "en"): string {
  if (!isBusMaker(maker)) return maker;
  return lang === "en" ? makerEn[maker] : maker;
}

export function knownMakerModel(maker: string, model: string): boolean {
  if (!isBusMaker(maker)) return false;
  return busModelsByMaker[maker].includes(model);
}

export function makerForModel(model: string): BusMaker | "" {
  for (const maker of busMakers) {
    if (busModelsByMaker[maker].includes(model)) return maker;
  }
  return "";
}
