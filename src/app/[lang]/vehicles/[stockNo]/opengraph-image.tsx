import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { priceView } from "@/lib/domain/money";
import { vehicleTitle } from "@/lib/domain/vehicle-catalog";
import { parseLang } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function VehicleOg({ params }: { params: Promise<{ lang: string; stockNo: string }> }) {
  const { lang: raw, stockNo } = await params;
  const lang = parseLang(raw) ?? "ko";
  const font = await readFile(path.join(process.cwd(), "node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff"));
  const site = await loadSite();
  const vehicle = site.ok ? await site.repo.getPublicByStockNo(stockNo) : null;
  const title = vehicle ? vehicleTitle(vehicle, lang) : stockNo
  const price = vehicle ? priceView(vehicle, "domestic", lang).primary : "";
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f4f6f8", color: "#0b1f3a", padding: 64 }}>
      <div style={{ display: "flex", fontSize: 28 }}>K-BUS HUB{site.ok && site.source === "demo" ? " · DEMO" : ""}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 32 }}>{vehicle ? `${vehicle.stockNo} · ${vehicle.modelYear ?? ""}` : stockNo}</div>
        <div style={{ display: "flex", fontSize: 36 }}>{price}</div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Noto Sans KR", data: font, weight: 700 }] },
  );
}
