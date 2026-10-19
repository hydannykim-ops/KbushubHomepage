import Link from "next/link";
import { notFound } from "next/navigation";
import { copy } from "@/lib/i18n";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";

export default async function GuidePage({
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

  return (
    <div className="mx-auto grid max-w-3xl gap-8 px-4 py-8">
      <header className="grid gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{text.guideTitle}</h1>
        <p className="text-sm leading-6 text-muted">{text.guideNote}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={hrefTo(lang, "/vehicles", ctx, { mode: "export" })} className="bg-primary px-4 py-2.5 text-sm font-semibold text-white">
            {text.guideCtaInventory}
          </Link>
          <Link href={hrefTo(lang, "/inquiry", ctx, { mode: "export", kind: "quote" })} className="border border-line bg-white px-4 py-2.5 text-sm font-semibold">
            {text.guideCtaQuote}
          </Link>
        </div>
      </header>

      <section className="border border-line bg-white p-5">
        <h2 className="text-xl font-bold">{text.domesticProcess}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
          {text.domesticSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="text-xl font-bold">{text.exportProcess}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
          {text.exportSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="text-xl font-bold">{text.exportTrustTitle}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
          {text.exportTrustPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="border border-line bg-white p-5">
          <h2 className="text-lg font-bold">{text.exportTermsTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{text.exportTermsBody}</p>
        </article>
        <article className="border border-line bg-white p-5">
          <h2 className="text-lg font-bold">{text.exportShippingTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{text.exportShippingBody}</p>
        </article>
      </section>
    </div>
  );
}
