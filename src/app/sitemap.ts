import type { MetadataRoute } from "next";
import { getDataSource, siteUrl } from "@/lib/config";
import { getRepository } from "@/lib/data/repository";
import { langs } from "@/lib/i18n/langs";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (getDataSource() !== "supabase") return [];
  const base = siteUrl();
  const now = new Date();
  const paths = ["", "/vehicles", "/buses", "/sell", "/export-sell", "/scrap", "/wanted", "/privacy", "/inquiry"];
  const entries: MetadataRoute.Sitemap = [];
  // Korean first — primary search market for 중고버스 매매 / 버스수출.
  const orderedLangs = ["ko", ...langs.filter((lang) => lang !== "ko")];
  for (const lang of orderedLangs) {
    for (const path of paths) {
      const isHome = path === "";
      const isKo = lang === "ko";
      entries.push({
        url: `${base}/${lang}${path}`,
        lastModified: now,
        changeFrequency: isHome ? "daily" : "weekly",
        priority: isHome ? (isKo ? 1 : 0.8) : isKo ? 0.8 : 0.5,
      });
    }
  }
  const listed = await getRepository().listPublic({}, "domestic");
  for (const vehicle of listed.items) {
    for (const lang of orderedLangs) {
      entries.push({
        url: `${base}/${lang}/vehicles/${encodeURIComponent(vehicle.stockNo)}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: lang === "ko" ? 0.9 : 0.6,
      });
    }
  }
  return entries;
}
