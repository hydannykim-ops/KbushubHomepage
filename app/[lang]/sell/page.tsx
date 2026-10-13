import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SellForm } from "@/components/lead-forms";
import { getDict, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(lang).sell.title, description: getDict(lang).sell.lead };
}

export default async function SellPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = getDict(raw);
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.sell.title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{dict.sell.lead}</p>
      <div className="mt-8 border border-line bg-white p-5 md:p-6">
        <SellForm lang={raw} />
      </div>
    </div>
  );
}
