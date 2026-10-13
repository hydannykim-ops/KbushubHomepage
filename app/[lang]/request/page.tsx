import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RequestForm } from "@/components/lead-forms";
import { getDict, isLocale } from "@/lib/i18n";

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
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.request.title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{dict.request.lead}</p>
      <div className="mt-8 border border-line bg-white p-5 md:p-6">
        <RequestForm lang={raw} model={model} />
      </div>
    </div>
  );
}
