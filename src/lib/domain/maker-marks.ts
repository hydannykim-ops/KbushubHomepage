import type { BusMaker } from "./vehicle-catalog";

/** Short mark shown beside maker names in browse UI. */
export const makerMarks: Record<BusMaker, string> = {
  현대: "H",
  기아: "K",
  대우: "D",
  벤츠: "B",
  선롱버스: "S",
  수입버스: "I",
  기타: "·",
};

export function makerMark(maker: string): string {
  return (makerMarks as Record<string, string>)[maker] ?? "·";
}
