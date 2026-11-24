import type { Metadata } from "next";
import { getDataSource, siteUrl } from "@/lib/config";
import type { Lang, PublicVehicle } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { langs } from "@/lib/i18n/langs";

export type SeoPage = "home" | "vehicles" | "sell" | "export-sell" | "buses" | "scrap" | "wanted" | "privacy" | "inquiry";

/** Public IndexNow key. The matching file is served at `/${INDEXNOW_KEY}.txt`. */
export const INDEXNOW_KEY = "kbushub7f3a1c9e4b27";

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
      case "scrap":
        return { title: text.scrapTitle, description: text.scrapBody, h1: text.scrapTitle, lead: text.scrapBody };
      case "wanted":
        return { title: text.wantedTitle, description: text.wantedBody, h1: text.wantedTitle, lead: text.wantedBody };
      case "privacy":
        return { title: text.privacyTitle, description: `${text.privacyTitle}. ${text.metaDescription}` };
      case "inquiry":
        return {
          title: "중고버스 문의",
          description: "중고버스 구매·수출 문의를 K-BUS HUB에 남겨 주세요. 담당자가 확인합니다.",
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
    case "scrap":
      return { title: text.scrapTitle, description: text.scrapBody, h1: text.scrapTitle, lead: text.scrapBody };
    case "wanted":
      return { title: text.wantedTitle, description: text.wantedBody, h1: text.wantedTitle, lead: text.wantedBody };
    case "privacy":
      return { title: text.privacyTitle, description: text.metaDescription };
    case "inquiry":
      return { title: text.inquiry, description: text.metaDescription };
  }
}

/** hreflang map. Korean is the default document for every path. */
export function languageAlternates(pathSuffix = ""): Record<string, string> {
  const path = pathSuffix.startsWith("/") ? pathSuffix : pathSuffix ? `/${pathSuffix}` : "";
  const languages: Record<string, string> = {};
  for (const code of langs) languages[code] = `${siteUrl()}/${code}${path}`;
  languages["x-default"] = `${siteUrl()}/ko${path}`;
  return languages;
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
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title: absoluteTitle ?? `${seo.title} · K-BUS HUB`,
      description: seo.description,
      url,
      siteName: "K-BUS HUB",
      locale: lang === "ko" ? "ko_KR" : undefined,
      type: "website",
      images: [{ url: "/brand/kbus-hub-logo.jpg", alt: "K-BUS HUB" }],
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
    image: `${base}/brand/kbus-hub-logo.jpg`,
    description:
      "한국 중고버스 매매·중고버스매매·버스수출 매물을 소개하는 K-BUS HUB입니다.",
    areaServed: ["KR", "Worldwide"],
    availableLanguage: ["ko", "en", "es", "fr", "km", "mn"],
    sameAs: [base],
  };
}

/** Korean vehicle page structured data. Omits price when the listing is ask-only. */
export function vehicleJsonLd(vehicle: PublicVehicle) {
  const base = siteUrl();
  const url = `${base}/ko/vehicles/${encodeURIComponent(vehicle.stockNo)}`;
  const cover = vehicle.photos.find((photo) => photo.isCover && !photo.placeholder) ?? vehicle.photos.find((photo) => !photo.placeholder);
  const name = [vehicle.maker, vehicle.model, vehicle.modelYear ? String(vehicle.modelYear) : ""].filter(Boolean).join(" ");
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name,
    brand: { "@type": "Brand", name: vehicle.maker },
    model: vehicle.model,
    url,
    itemCondition: "https://schema.org/UsedCondition",
  };
  if (vehicle.modelYear) data.vehicleModelDate = String(vehicle.modelYear);
  if (vehicle.mileageKm != null) {
    data.mileageFromOdometer = { "@type": "QuantitativeValue", value: vehicle.mileageKm, unitCode: "KMT" };
  }
  if (vehicle.seats != null) data.seatingCapacity = vehicle.seats;
  if (cover) data.image = `${base}/api/media/photo/${cover.id}`;
  if (vehicle.descriptionKo) data.description = vehicle.descriptionKo.slice(0, 300);
  if (vehicle.domesticPriceKrw != null) {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "KRW",
      price: vehicle.domesticPriceKrw,
      availability: vehicle.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url,
    };
  }
  return data;
}
