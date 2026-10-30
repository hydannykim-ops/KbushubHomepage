import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { Consent, EnhanceForm, Field, Honeypot, SubmitBanner } from "@/components/forms";
import { scrapRegionsKo } from "@/lib/domain/scrap-regions";
import { copy } from "@/lib/i18n";
import { parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

export default async function ScrapQuotePage({
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
  await requestContext(lang, sp);
  const site = await loadSite();
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;
  const text = copy(lang);

  const form = (
    <div className="border border-line bg-white p-5 shadow-[0_12px_40px_rgba(15,28,47,0.06)]">
      <SubmitBanner lang={lang} submitted={sp.get("submitted") ?? undefined} error={sp.get("error") ?? undefined} />
      <EnhanceForm action="/api/requests/scrap" lang={lang}>
        <input type="hidden" name="lang" value={lang} />
        <Field label={text.scrapPlate} name="plateNo" required placeholder={text.scrapPlateHint} />
        <Field label={text.scrapModel} name="model" required placeholder={text.scrapModelHint} />
        <Field label={text.modelYear} name="modelYear" />
        <label className="grid gap-1 text-sm font-medium">
          {text.scrapRegion}
          <select name="location" required className="rounded-md border border-line bg-white px-3 py-2 font-normal" defaultValue="">
            <option value="" disabled>
              {text.scrapRegionHint}
            </option>
            {scrapRegionsKo.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
        <Field label={text.name} name="name" required />
        <Field label={text.contact} name="phone" required />
        <Field label={text.email} name="email" type="email" />
        <Field label={text.message} name="message" as="textarea" />
        <Consent lang={lang} />
        <Honeypot lang={lang} />
      </EnhanceForm>
    </div>
  );

  const reasons = [
    [text.scrapReason1Title, text.scrapReason1Body],
    [text.scrapReason2Title, text.scrapReason2Body],
    [text.scrapReason3Title, text.scrapReason3Body],
  ] as const;
  const steps = [
    [text.scrapStep1Title, text.scrapStep1Body],
    [text.scrapStep2Title, text.scrapStep2Body],
    [text.scrapStep3Title, text.scrapStep3Body],
    [text.scrapStep4Title, text.scrapStep4Body],
  ] as const;
  const faqs = [
    [text.scrapFaq1Q, text.scrapFaq1A],
    [text.scrapFaq2Q, text.scrapFaq2A],
    [text.scrapFaq3Q, text.scrapFaq3A],
  ] as const;

  return (
    <div className="mx-auto grid max-w-6xl gap-14 px-4 py-10 md:py-14">
      <section className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-primary">K-BUS HUB</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">{text.scrapTitle}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">{text.scrapBody}</p>
          <ul className="mt-6 grid gap-3 text-sm text-ink">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {text.scrapPromise1}
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {text.scrapPromise2}
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-warm" />
              {text.scrapPromise3}
            </li>
          </ul>
          {site.source !== "demo" && !site.settings.privacyCollectionEnabled ? (
            <p className="mt-5 text-sm text-muted">{text.liveClosedNote}</p>
          ) : null}
        </div>
        <div id="quote">{form}</div>
      </section>

      <section>
        <h2 className="section-title text-2xl font-semibold tracking-tight text-ink">{text.scrapWhyTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {reasons.map(([title, body]) => (
            <article key={title} className="border border-primary/15 bg-primary-soft/50 p-5">
              <h3 className="text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title text-2xl font-semibold tracking-tight text-ink">{text.scrapProcessTitle}</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(([title, body], index) => (
            <li key={title} className="border border-line bg-white p-5">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary">0{index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 border border-line bg-white p-6 md:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-xl font-semibold text-ink">{text.scrapDocsTitle}</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{text.scrapDocsBody}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-ink">{text.scrapFaqTitle}</h2>
          <dl className="mt-4 grid gap-4">
            {faqs.map(([q, a]) => (
              <div key={q}>
                <dt className="text-sm font-semibold text-ink">{q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
