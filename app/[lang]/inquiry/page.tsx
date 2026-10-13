import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/inquiry-form";
import { getDict, isLocale } from "@/lib/i18n";
import { tradeMode } from "@/lib/request-context";
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
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.guide.contact}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{dict.detail.formLead}</p>
      <div className="mt-8 border border-line bg-white p-5 md:p-6">
        <InquiryForm lang={raw} trade={trade} kinds={kinds} defaultKind="general" />
      </div>
    </div>
  );
}
