import type { Metadata } from "next";
import { getDataSource, siteUrl } from "@/lib/config";
import type { Lang } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";

export type SeoPage = "home" | "vehicles" | "sell" | "export-sell" | "buses";

type PageSeo = {
  title: string;
  description: string;
  h1?: string;
  lead?: string;
};

/** Korean search phrases the public pages should support. */
export function pageSeo(lang: Lang, page: SeoPage): PageSeo {
  const text = copy(lang);
  if (lang === "ko") {
    switch (page) {
      case "home":
        return {
          title: "중고버스 매매·버스수출",
          description:
            "K-BUS HUB에서 중고버스 매매, 중고버스매매, 버스수출 매물을 확인하세요. 현대 E-카운티와 한국 중고버스를 국내 판매·수출로 소개합니다.",
        };
      case "vehicles":
        return {
          title: "중고버스 매물",
          description:
            "중고버스 매매와 버스 수출용 재고를 차급·제조사·연식으로 찾아보세요. K-BUS HUB 중고버스 매물 목록입니다.",
          h1: "중고버스 매물",
          lead: "국내 중고버스 매매와 버스 수출용 재고를 한곳에서 확인하세요.",
        };
      case "sell":
        return {
          title: "중고버스 매매 · 내 차 팔기",
          description:
            "보유하신 중고버스 매매 상담을 남겨 주세요. K-BUS HUB가 매입 문의를 접수하고 담당자가 연락드립니다.",
          h1: "중고버스 매매 · 내 차 팔기",
          lead: "버스를 팔고 싶으시면 매입 상담을 남겨 주세요. 중고버스매매 문의는 담당자가 연락드립니다.",
        };
      case "export-sell":
        return {
          title: "버스수출 · 내 차 수출하기",
          description:
            "내 버스를 해외로 보내는 버스수출 상담. RoRo·선적·수출 서류 흐름을 K-BUS HUB에서 안내합니다.",
          h1: "버스수출 · 내 차 수출하기",
          lead: "차종·연식·상태와 희망 목적국만 남겨 주세요. 버스수출 상담은 접수 후 담당자가 안내합니다.",
        };
      case "buses":
        return {
          title: "중형·대형 중고버스",
          description:
            "중형·대형 중고버스 매물을 차급으로 나눠 봅니다. 중고버스 매매·버스수출 재고를 K-BUS HUB에서 확인하세요.",
          h1: "중형·대형 중고버스",
          lead: "중형과 대형 중고버스를 같은 재고에서 차급으로 나눠 볼 수 있습니다.",
        };
    }
  }

  switch (page) {
    case "home":
      return { title: "K-BUS HUB", description: text.metaDescription };
    case "vehicles":
      return {
        title: text.navVehicles,
        description: text.metaDescription,
        h1: text.navVehicles,
        lead: text.heroBody,
      };
    case "sell":
      return {
        title: text.sellTitle,
        description: text.sellBody,
        h1: text.sellTitle,
        lead: text.sellLead,
      };
    case "export-sell":
      return {
        title: text.exportSellTitle,
        description: text.exportSellBody,
        h1: text.exportSellTitle,
        lead: text.exportSellBody,
      };
    case "buses":
      return {
        title: text.busesTitle,
        description: text.busesBody,
        h1: text.busesTitle,
        lead: text.busesBody,
      };
  }
}

export function buildPageMetadata(lang: Lang, page: SeoPage, pathSuffix = ""): Metadata {
  const seo = pageSeo(lang, page);
  const demo = getDataSource() !== "supabase";
  const path = pathSuffix.startsWith("/") ? pathSuffix : pathSuffix ? `/${pathSuffix}` : "";
  const url = `${siteUrl()}/${lang}${path}`;
  const absoluteTitle = lang === "ko" ? `${seo.title} | K-BUS HUB` : undefined;
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : seo.title,
    description: seo.description,
    robots: demo ? { index: false, follow: false } : { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: absoluteTitle ?? `${seo.title} · K-BUS HUB`,
      description: seo.description,
      url,
      siteName: "K-BUS HUB",
      locale: lang === "ko" ? "ko_KR" : undefined,
      type: "website",
    },
  };
}

export function organizationJsonLd() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: "K-BUS HUB",
    url: base,
    description:
      "한국 중고버스 매매·중고버스매매·버스수출 매물을 소개하는 K-BUS HUB입니다.",
    areaServed: ["KR", "Worldwide"],
    availableLanguage: ["ko", "en", "es", "fr", "km", "mn"],
    sameAs: [base],
  };
}
