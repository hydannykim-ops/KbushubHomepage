import type { BusMaker } from "./vehicle-catalog";

/** Public logo assets under /public/makers (Wikimedia Commons + site marks). */
export const makerLogoSrc: Record<BusMaker, string> = {
  현대: "/makers/hyundai.png",
  기아: "/makers/kia.png",
  대우: "/makers/daewoo.png",
  벤츠: "/makers/mercedes.png",
  선롱버스: "/makers/sunlong.png",
  수입버스: "/makers/import.png",
  기타: "/makers/other.png",
};

/** Short letter fallback if an image fails to load. */
export const makerMarks: Record<BusMaker, string> = {
  현대: "H",
  기아: "K",
  대우: "D",
  벤츠: "B",
  선롱버스: "S",
  수입버스: "I",
  기타: "·",
};

export function makerLogo(maker: string): string | null {
  return (makerLogoSrc as Record<string, string>)[maker] ?? null;
}

export function makerMark(maker: string): string {
  return (makerMarks as Record<string, string>)[maker] ?? "·";
}
