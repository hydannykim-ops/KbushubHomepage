import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource/noto-sans-kr/400.css";
import "@fontsource/noto-sans-kr/500.css";
import "@fontsource/noto-sans-kr/700.css";
import { siteUrl } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "K-BUS HUB", template: "%s · K-BUS HUB" },
  description: "한국 중고버스와 현대 카운티의 국내 판매·수출 매물",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const lang = headerList.get("x-kb-lang") === "en" ? "en" : "ko";
  return (
    <html lang={lang}>
      <body className="min-h-screen antialiased">
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
          {lang === "en" ? "Skip to content" : "본문으로 이동"}
        </a>
        {children}
      </body>
    </html>
  );
}
