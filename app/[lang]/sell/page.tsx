import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SellForm } from "@/components/lead-forms";
import { PageIntro } from "@/components/page-intro";
import { getDict, isLocale } from "@/lib/i18n";
import { panel } from "@/lib/ui";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(lang).sell.title, description: getDict(lang).sell.lead };
}

export default async function SellPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = getDict(raw);
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:py-16">
      <PageIntro title={dict.sell.title} lead={dict.sell.lead} />
      <div className={`${panel} mt-8 p-5 md:p-8`}>
        <SellForm lang={raw} />
      </div>
    </div>
  );
}
