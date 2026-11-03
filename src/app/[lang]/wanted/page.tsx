import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { Consent, EnhanceForm, Field, Honeypot, SubmitBanner } from "@/components/forms";
import { MakerModelPicker } from "@/components/maker-model-picker";
import { StickyQuoteLayout } from "@/components/sticky-quote-layout";
import { copy } from "@/lib/i18n";
import { parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

export default async function WantedPage({
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
    <div className="quote-card relative isolate overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-[0_12px_36px_rgba(15,28,47,0.06)]">
      <SubmitBanner lang={lang} submitted={sp.get("submitted") ?? undefined} error={sp.get("error") ?? undefined} />
      <EnhanceForm action="/api/requests/wanted" lang={lang}>
        <input type="hidden" name="lang" value={lang} />
        <FormSection title={text.wantedSectionVehicle}>
          <MakerModelPicker lang={lang} allowEmpty emptyLabel={text.noPreference} defaultModel={sp.get("model") ?? ""} />
        </FormSection>
        <FormSection title={text.wantedSectionBudget}>
          <div className="grid grid-cols-2 gap-3">
            <Field label={text.budget} name="budgetAmount" type="number" />
            <label className="grid gap-1 text-sm font-medium">
              {text.currency}
              <select name="budgetCurrency" className="rounded-md border border-line bg-white px-3 py-2 font-normal" defaultValue="USD">
                {["KRW", "USD", "EUR", "JPY", "CNY", "AED"].map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </label>
          </div>
          <Field label={text.quantity} name="quantity" required defaultValue="1" />
        </FormSection>
        <FormSection title={text.wantedSectionSpec}>
          <Field label={text.wantedYearLabel} name="modelYear" inputMode="numeric" placeholder="2020" hint={text.wantedYearHint} />
          <Field label={text.wantedSeatsLabel} name="seats" inputMode="numeric" placeholder="28" hint={text.wantedSeatsHint} />
        </FormSection>
        <FormSection title={text.wantedSectionRoute}>
          <Field label={text.destinationCountry} name="destinationCountry" required />
          <Field label={text.desiredTime} name="desiredTime" />
        </FormSection>
        <FormSection title={text.wantedSectionContact}>
          <Field label={text.name} name="name" required />
          <Field label={text.contact} name="phone" />
          <Field label={text.email} name="email" type="email" />
          <Field label={text.message} name="message" as="textarea" />
        </FormSection>
        <Consent lang={lang} />
        <Honeypot lang={lang} />
      </EnhanceForm>
    </div>
  );

  const reasons = [
    [text.wantedReason1Title, text.wantedReason1Body],
    [text.wantedReason2Title, text.wantedReason2Body],
    [text.wantedReason3Title, text.wantedReason3Body],
  ] as const;
  const steps = [
    [text.wantedStep1Title, text.wantedStep1Body],
    [text.wantedStep2Title, text.wantedStep2Body],
    [text.wantedStep3Title, text.wantedStep3Body],
    [text.wantedStep4Title, text.wantedStep4Body],
  ] as const;
  const faqs = [
    [text.wantedFaq1Q, text.wantedFaq1A],
    [text.wantedFaq2Q, text.wantedFaq2A],
    [text.wantedFaq3Q, text.wantedFaq3A],
  ] as const;

  const intro = (
    <div>
      <p className="tone-text text-xs font-semibold tracking-[0.16em]">K-BUS HUB</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">{text.wantedTitle}</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">{text.wantedBody}</p>
      <ul className="mt-5 grid gap-2.5 text-sm text-ink">
        <li className="flex gap-2">
          <span className="tone-dot mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
          {text.wantedPromise1}
        </li>
        <li className="flex gap-2">
          <span className="tone-dot mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
          {text.wantedPromise2}
        </li>
        <li className="flex gap-2">
          <span className="tone-dot-alt mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
          {text.wantedPromise3}
        </li>
      </ul>
      {site.source !== "demo" && !site.settings.privacyCollectionEnabled ? (
        <p className="mt-5 text-sm text-muted">{text.liveClosedNote}</p>
      ) : null}
    </div>
  );

  return (
    <StickyQuoteLayout tone="wanted" intro={intro} form={form}>
      <section>
        <h2 className="section-title text-2xl font-semibold tracking-tight text-ink">{text.wantedWhyTitle}</h2>
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
        <h2 className="section-title text-2xl font-semibold tracking-tight text-ink">{text.wantedProcessTitle}</h2>
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

      <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
        <h2 className="text-xl font-semibold text-ink">{text.wantedFaqTitle}</h2>
        <dl className="mt-4 grid gap-4">
          {faqs.map(([q, a]) => (
            <div key={q}>
              <dt className="text-sm font-semibold text-ink">{q}</dt>
              <dd className="mt-1 text-sm leading-6 text-muted">{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </StickyQuoteLayout>
  );
}
