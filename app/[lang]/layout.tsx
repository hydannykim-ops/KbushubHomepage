import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DataProblem } from "@/components/data-problem";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLiveMode } from "@/lib/demo-accounts";
import { getDict, isLocale } from "@/lib/i18n";
import { tradeMode } from "@/lib/request-context";
import { publicData } from "@/lib/store";
import type { Settings } from "@/lib/types";

export const dynamic = "force-dynamic";

const emptySettings: Settings = {
  companyNameKo: "K-BUS HUB",
  companyNameEn: "K-BUS HUB",
  representative: "",
  businessNo: "",
  phone: "",
  kakaoUrl: "",
  whatsapp: "",
  email: "",
  addressKo: "",
  addressEn: "",
  hoursKo: "",
  hoursEn: "",
  privacyIntakeEnabled: false,
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const trade = await tradeMode();
  const data = await publicData();
  const dict = getDict(raw);
  return (
    <>
      {isLiveMode() ? null : (
        <p className="bg-sand px-5 py-2 text-center text-[12px] leading-5 text-muted">{dict.common.demoBanner}</p>
      )}
      <Suspense fallback={<div className="h-16 border-b border-line bg-white" />}>
        <SiteHeader lang={raw} trade={trade} />
      </Suspense>
      <div id="main">{data.ok ? children : <DataProblem lang={raw} reason={data.reason} />}</div>
      <SiteFooter lang={raw} trade={trade} settings={data.ok ? data.settings : emptySettings} />
    </>
  );
}
