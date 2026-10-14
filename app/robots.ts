import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/paths";

export default function robots(): MetadataRoute.Robots {
  if (process.env.DATA_MODE !== "live") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/*/admin", "/*/agent"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
