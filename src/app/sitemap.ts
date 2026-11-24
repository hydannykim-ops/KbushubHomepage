import type { MetadataRoute } from "next";
import { getDataSource, siteUrl } from "@/lib/config";
import { getRepository } from "@/lib/data/repository";
import { langs } from "@/lib/i18n/langs";
import { languageAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

function priorityFor(lang: string, path: string) {
  const vehicle = path.startsWith("/vehicles/");
  if (lang !== "ko") return vehicle ? 0.3 : 0.2;
  if (path === "") return 1;
  if (path === "/vehicles") return 0.9;
  if (vehicle) return 0.8;
  if (path === "/sell" || path === "/export-sell") return 0.7;
  return 0.5;
}

function entry(lang: string, path: string, lastModified?: Date): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl()}/${lang}${path}`,
    lastModified,
    changeFrequency: path.startsWith("/vehicles/") ? "daily" : "weekly",
    priority: priorityFor(lang, path),
    alternates: { languages: languageAlternates(path) },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (getDataSource() !== "supabase") return [];
  const paths = ["", "/vehicles", "/buses", "/sell", "/export-sell", "/scrap", "/wanted", "/privacy", "/inquiry"];
  const entries: MetadataRoute.Sitemap = [];
  for (const lang of langs) {
    for (const path of paths) entries.push(entry(lang, path));
  }
  const listed = await getRepository().listPublic({}, "domestic");
  for (const vehicle of listed.items) {
    const updated = new Date(vehicle.updatedAt);
    const lastModified = Number.isNaN(updated.getTime()) ? undefined : updated;
    const path = `/vehicles/${encodeURIComponent(vehicle.stockNo)}`;
    for (const lang of langs) entries.push(entry(lang, path, lastModified));
  }
  return entries;
}
