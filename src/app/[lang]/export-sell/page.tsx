import Link from "next/link";
import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { Consent, EnhanceForm, Field, Honeypot, SubmitBanner } from "@/components/forms";
import { MakerModelPicker } from "@/components/maker-model-picker";
import { PhotoSlotUploader } from "@/components/photo-slot-uploader";
import { StickyQuoteLayout } from "@/components/sticky-quote-layout";
import { copy } from "@/lib/i18n";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

export default async function ExportSellPage({
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
  const site = await loadSite();
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;
  const text = copy(lang);

  if (lang !== "ko") {
    return (
      <div className="page-tone -mx-4 px-4 py-10" data-tone="export">
        <div className="mx-auto max-w-xl">
          <p className="tone-text text-xs font-semibold tracking-[0.16em]">K-BUS HUB</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{text.exportSellTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{text.exportSellDomesticOnly}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={hrefTo(lang, "/vehicles", ctx)} className="tone-cta inline-flex px-4 py-3 text-sm font-semibold text-white">
              {text.browseInventory}
            </Link>
            <Link href={hrefTo(lang, "/wanted", ctx)} className="inline-flex rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold">
              {text.navWanted}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const form = (
    <div className="quote-card rounded-2xl border border-line bg-white p-5 shadow-[0_12px_36px_rgba(15,28,47,0.06)]">
      <p className="mb-4 text-sm leading-6 text-muted">{text.exportSellPhotoNote}</p>
      <SubmitBanner lang={lang} submitted={sp.get("submitted") ?? undefined} error={sp.get("error") ?? undefined} />
      <EnhanceForm action="/api/requests/export-sell" lang={lang}>
        <input type="hidden" name="lang" value={lang} />
        <MakerModelPicker lang={lang} required />
        <Field label={text.modelYear} name="modelYear" />
        <Field label={text.mileage} name="mileageKm" />
        <Field label={text.location} name="location" required />
        <Field label={text.destinationCountry} name="destinationCountry" placeholder={text.exportSellDestinationHint} />
        <label className="grid gap-1 text-sm font-medium">
          {text.shippingMethod}
          <select name="shippingMethod" className="rounded-md border border-line bg-white px-3 py-2 font-normal" defaultValue="">
            <option value="">{text.shippingUndecided}</option>
            <option value="roro">{text.shippingRoro}</option>
            <option value="container">{text.shippingContainer}</option>
          </select>
        </label>
        <p className="text-xs leading-5 text-muted">{text.shippingHint}</p>
        <Field label={text.askingPrice} name="askingPriceAmount" type="number" />
        <label className="grid gap-1 text-sm font-medium">
          {text.currency}
          <select name="askingPriceCurrency" className="rounded-md border border-line bg-white px-3 py-2 font-normal" defaultValue="KRW">
            {["KRW", "USD", "EUR"].map((currency) => (
              <option key={currency}>{currency}</option>
            ))}
          </select>
        </label>
        <Field label={text.name} name="name" required />
        <Field label={text.contact} name="phone" required />
        <Field label={text.email} name="email" type="email" />
        <Field label={text.message} name="message" as="textarea" />
        <PhotoSlotUploader lang={lang} optional />
        <Consent lang={lang} />
        <Honeypot lang={lang} />
      </EnhanceForm>
    </div>
  );

  const reasons = [
    [text.exportSellReason1Title, text.exportSellReason1Body],
    [text.exportSellReason2Title, text.exportSellReason2Body],
    [text.exportSellReason3Title, text.exportSellReason3Body],
  ] as const;
  const steps = [
    [text.exportSellStep1Title, text.exportSellStep1Body],
    [text.exportSellStep2Title, text.exportSellStep2Body],
    [text.exportSellStep3Title, text.exportSellStep3Body],
    [text.exportSellStep4Title, text.exportSellStep4Body],
  ] as const;
  const faqs = [
    [text.exportSellFaq1Q, text.exportSellFaq1A],
    [text.exportSellFaq2Q, text.exportSellFaq2A],
    [text.exportSellFaq3Q, text.exportSellFaq3A],
  ] as const;

  const intro = (
    <div>
      <p className="tone-text text-xs font-semibold tracking-[0.16em]">K-BUS HUB</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">{text.exportSellTitle}</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">{text.exportSellBody}</p>
      <ul className="mt-5 grid gap-2.5 text-sm text-ink">
        <li className="flex gap-2">
          <span className="tone-dot mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
          {text.exportSellPromise1}
        </li>
        <li className="flex gap-2">
          <span className="tone-dot mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
          {text.exportSellPromise2}
        </li>
        <li className="flex gap-2">
          <span className="tone-dot-alt mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
          {text.exportSellPromise3}
        </li>
      </ul>
      {site.source !== "demo" && !site.settings.privacyCollectionEnabled ? (
        <p className="mt-5 text-sm text-muted">{text.liveClosedNote}</p>
      ) : null}
    </div>
  );

  return (
    <StickyQuoteLayout tone="export" intro={intro} form={form}>
      <section>
        <h2 className="section-title text-2xl font-semibold tracking-tight text-ink">{text.exportSellWhyTitle}</h2>
        <div className="mt-5 grid gap-3">
          {reasons.map(([title, body]) => (
            <article key={title} className="tone-panel rounded-2xl px-4 py-4">
              <h3 className="text-base font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title text-2xl font-semibold tracking-tight text-ink">{text.exportSellProcessTitle}</h2>
        <ol className="mt-5 grid gap-0 overflow-hidden rounded-2xl border border-line bg-white">
          {steps.map(([title, body], index) => (
            <li key={title} className="grid gap-1 border-b border-line px-4 py-4 last:border-b-0 sm:grid-cols-[3rem_1fr] sm:gap-3">
              <p className="tone-text text-xs font-semibold tracking-[0.14em]">0{index + 1}</p>
              <div>
                <h3 className="text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-8 rounded-2xl border border-line bg-white p-5 md:p-6">
        <div>
          <h2 className="text-xl font-semibold text-ink">{text.exportSellDocsTitle}</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{text.exportSellDocsBody}</p>
        </div>
        <div className="border-t border-line pt-6">
          <h2 className="text-xl font-semibold text-ink">{text.exportSellFaqTitle}</h2>
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
    </StickyQuoteLayout>
  );
}
