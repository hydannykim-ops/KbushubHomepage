import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RequestForm } from "@/components/lead-forms";
import { PageIntro } from "@/components/page-intro";
import { getDict, isLocale } from "@/lib/i18n";
import { panel } from "@/lib/ui";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(lang).request.title, description: getDict(lang).request.lead };
}

export default async function RequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const query = await searchParams;
  const model = typeof query.model === "string" ? query.model : "";
  const dict = getDict(raw);
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:py-16">
      <PageIntro title={dict.request.title} lead={dict.request.lead} />
      <div className={`${panel} mt-8 p-5 md:p-8`}>
        <RequestForm lang={raw} model={model} />
      </div>
    </div>
  );
}
