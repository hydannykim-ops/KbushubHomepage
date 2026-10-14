import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/paths";
import { publicData } from "@/lib/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.DATA_MODE !== "live") return [];
  const data = await publicData();
  const base = siteUrl();
  const paths = ["", "/inventory", "/buses", "/guide", "/sell", "/request", "/partners", "/inquiry", "/privacy"];
  const entries: MetadataRoute.Sitemap = [];
  for (const lang of ["ko", "en"]) {
    for (const path of paths) {
      entries.push({ url: `${base}/${lang}${path}`, changeFrequency: "weekly" });
    }
    if (data.ok) {
      for (const vehicle of data.vehicles.filter((item) => item.status !== "hidden")) {
        entries.push({ url: `${base}/${lang}/inventory/${vehicle.id}`, changeFrequency: "daily" });
      }
    }
  }
  return entries;
}
