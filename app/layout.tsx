import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { siteUrl } from "@/lib/paths";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
  fallback: ["Apple SD Gothic Neo", "Noto Sans KR", "sans-serif"],
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "K-BUS HUB",
    template: "%s · K-BUS HUB",
  },
  description:
    "한국 중고버스와 현대 카운티의 국내 판매·해외 수출 안내. 데모 화면은 실제 재고가 아닙니다.",
  robots: process.env.DATA_MODE === "live" ? { index: true, follow: true } : { index: false, follow: false },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = (await headers()).get("x-kb-lang") === "en" ? "en" : "ko";
  return (
    <html lang={lang} className={`${pretendard.variable} ${mono.variable}`}>
      <body className={`${pretendard.className} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}
