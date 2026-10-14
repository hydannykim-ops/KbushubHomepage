import type { MetadataRoute } from "next";
import { getDataSource, siteUrl } from "@/lib/config";
import { getRepository } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (getDataSource() !== "supabase") return [];
  const base = siteUrl();
  const paths = ["", "/vehicles", "/buses", "/sell", "/guide", "/partner", "/wanted", "/privacy", "/inquiry"];
  const entries: MetadataRoute.Sitemap = [];
  for (const lang of ["ko", "en"]) {
    for (const path of paths) {
      entries.push({ url: `${base}/${lang}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.6 });
    }
  }
  const listed = await getRepository().listPublic({}, "domestic");
  for (const vehicle of listed.items) {
    for (const lang of ["ko", "en"]) {
      entries.push({ url: `${base}/${lang}/vehicles/${encodeURIComponent(vehicle.stockNo)}`, changeFrequency: "daily", priority: 0.8 });
    }
  }
  return entries;
}
