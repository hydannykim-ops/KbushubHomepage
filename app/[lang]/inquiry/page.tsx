import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/inquiry-form";
import { PageIntro } from "@/components/page-intro";
import { getDict, isLocale } from "@/lib/i18n";
import { tradeMode } from "@/lib/request-context";
import { panel } from "@/lib/ui";
import type { InquiryKind } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(lang).guide.contact };
}

export default async function InquiryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const trade = await tradeMode();
  const dict = getDict(raw);
  const kinds: InquiryKind[] = trade === "export" ? ["quote", "general"] : ["general", "purchase"];
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:py-16">
      <PageIntro title={dict.guide.contact} lead={dict.detail.formLead} />
      <div className={`${panel} mt-8 p-5 md:p-8`}>
        <InquiryForm lang={raw} trade={trade} kinds={kinds} defaultKind="general" />
      </div>
    </div>
  );
}
