import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { copy } from "@/lib/i18n";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
import { buildPageMetadata, pageSeo } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = parseLang((await params).lang) ?? "ko";
  return buildPageMetadata(lang, "buses", "/buses");
}

export default async function BusesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lang = parseLang((await params).lang);
  if (!lang) notFound();
  const raw = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) if (typeof value === "string") sp.set(key, value);
  const ctx = await requestContext(lang, sp);
  const text = copy(lang);
  const seo = pageSeo(lang, "buses");
  return (
    <div className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
      <h1 className="text-3xl font-bold">{seo.h1 ?? text.busesTitle}</h1>
      <p className="text-muted">{seo.lead ?? text.busesBody}</p>
      <Link className="rounded-lg border border-line bg-white p-5 text-lg font-semibold" href={hrefTo(lang, "/vehicles", ctx, { class: "medium" })}>
        {text.classMedium}
      </Link>
      <Link className="rounded-lg border border-line bg-white p-5 text-lg font-semibold" href={hrefTo(lang, "/vehicles", ctx, { class: "large" })}>
        {text.classLarge}
      </Link>
    </div>
  );
}
