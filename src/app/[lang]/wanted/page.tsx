import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { Consent, EnhanceForm, Field, Honeypot, SubmitBanner } from "@/components/forms";
import { MakerModelPicker } from "@/components/maker-model-picker";
import { copy } from "@/lib/i18n";
import { parseLang } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

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
  const site = await loadSite();
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;
  const text = copy(lang);
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold">{text.wantedTitle}</h1>
      <p className="mt-2 text-sm text-muted">{text.wantedBody}</p>
      {site.source !== "demo" && !site.settings.privacyCollectionEnabled ? (
        <p className="mt-2 text-sm text-muted">{text.liveClosedNote}</p>
      ) : null}
      <div className="mt-6">
        <SubmitBanner lang={lang} submitted={sp.get("submitted") ?? undefined} error={sp.get("error") ?? undefined} />
        <EnhanceForm action="/api/requests/wanted" lang={lang}>
          <input type="hidden" name="lang" value={lang} />
          <MakerModelPicker lang={lang} required defaultModel={sp.get("model") ?? ""} />
          <Field label={text.budget} name="budgetAmount" type="number" />
          <label className="grid gap-1 text-sm font-medium">
            {text.currency}
            <select name="budgetCurrency" className="rounded-md border border-line px-3 py-2 font-normal" defaultValue="USD">
              {["KRW", "USD", "EUR", "JPY", "CNY", "AED"].map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </label>
          <Field label={text.wantedYearLabel} name="modelYear" inputMode="numeric" placeholder="2020" hint={text.wantedYearHint} />
          <Field label={text.wantedSeatsLabel} name="seats" inputMode="numeric" placeholder="28" hint={text.wantedSeatsHint} />
          <Field label={text.quantity} name="quantity" required defaultValue="1" />
          <Field label={text.destinationCountry} name="destinationCountry" required />
          <Field label={text.desiredTime} name="desiredTime" />
          <Field label={text.name} name="name" required />
          <Field label={text.email} name="email" type="email" />
          <Field label={text.contact} name="phone" />
          <Field label={text.message} name="message" as="textarea" />
          <Consent lang={lang} />
          <Honeypot lang={lang} />
        </EnhanceForm>
      </div>
    </div>
  );
}
