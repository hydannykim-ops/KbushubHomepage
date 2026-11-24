import type { MetadataRoute } from "next";
import { getDataSource, siteUrl } from "@/lib/config";
import { langs } from "@/lib/i18n/langs";

const privatePaths = [
  "/admin",
  "/api/",
  ...langs.flatMap((lang) => [`/${lang}/agent`, `/${lang}/account`]),
];

export default function robots(): MetadataRoute.Robots {
  if (getDataSource() !== "supabase") return { rules: [{ userAgent: "*", disallow: "/" }] };
  const rule = { allow: "/", disallow: privatePaths };
  return {
    rules: [
      { userAgent: "Yeti", ...rule },
      { userAgent: "*", ...rule },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
