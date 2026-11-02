import Link from "next/link";
import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { Consent, EnhanceForm, Field, Honeypot, SubmitBanner } from "@/components/forms";
import { MakerModelPicker } from "@/components/maker-model-picker";
import { PhotoSlotUploader } from "@/components/photo-slot-uploader";
import { copy } from "@/lib/i18n";
import { parseLang, requestContext } from "@/lib/request-context";
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
  await requestContext(lang, sp);
  const site = await loadSite();
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;
  const text = copy(lang);

  const form = (
    <div id="quote" className="border border-line bg-white p-5 shadow-[0_12px_40px_rgba(15,28,47,0.06)]">
      <h2 className="text-xl font-semibold text-ink">{text.exportSellFormTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{text.exportSellPhotoNote}</p>
      <div className="mt-5">
        <SubmitBanner lang={lang} submitted={sp.get("submitted") ?? undefined} error={sp.get("error") ?? undefined} />
        <EnhanceForm action="/api/requests/export-sell" lang={lang}>
          <input type="hidden" name="lang" value={lang} />
          <MakerModelPicker lang={lang} required />
          <Field label={text.modelYear} name="modelYear" />
          <Field label={text.mileage} name="mileageKm" />
          <Field label={text.location} name="location" required />
          <Field label={text.destinationCountry} name="destinationCountry" placeholder={text.countryHint} />
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

  return (
    <div>
      <section className="relative min-h-[52vh] overflow-hidden bg-[#0f172a] text-white lg:min-h-[28rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/demo/hero-export.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-[#0c4a6e]/58 to-sky-900/30" />
        <div className="relative mx-auto flex min-h-[52vh] max-w-6xl flex-col justify-center px-4 py-14 lg:min-h-[28rem]">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/80">K-BUS HUB</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">{text.exportSellTitle}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/85">{text.exportSellBody}</p>
          <div className="mt-8">
            <Link
              href="#quote"
              className="inline-flex bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(21,94,239,0.35)] transition hover:bg-primary-deep"
            >
              {text.exportSellCta}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-14 px-4 py-10 md:py-14">
        <section className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-primary">K-BUS HUB</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{text.navExportSell}</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">{text.exportSellBody}</p>
            <ul className="mt-6 grid gap-3 text-sm text-ink">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {text.exportSellPromise1}
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {text.exportSellPromise2}
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-warm" />
                {text.exportSellPromise3}
              </li>
            </ul>
            {site.source !== "demo" && !site.settings.privacyCollectionEnabled ? (
              <p className="mt-5 text-sm text-muted">{text.liveClosedNote}</p>
            ) : null}
          </div>
          {form}
        </section>

        <section>
          <h2 className="section-title text-2xl font-semibold tracking-tight text-ink">{text.exportSellWhyTitle}</h2>
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
          <h2 className="section-title text-2xl font-semibold tracking-tight text-ink">{text.exportSellProcessTitle}</h2>
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
            <h2 className="text-xl font-semibold text-ink">{text.exportSellDocsTitle}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{text.exportSellDocsBody}</p>
          </div>
          <div>
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
      </div>
    </div>
  );
}
