import type { MetadataRoute } from "next";
import { getDataSource, siteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  if (getDataSource() !== "supabase") return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/ko/agent", "/en/agent"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
