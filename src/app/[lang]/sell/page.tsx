import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { Consent, EnhanceForm, Field, Honeypot, SubmitBanner } from "@/components/forms";
import { copy } from "@/lib/i18n";
import { parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

export default async function SellPage({
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
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold">{text.sellTitle}</h1>
      <p className="mt-2 text-sm text-muted">{text.sellBody}</p>
      <p className="mt-2 text-sm text-muted">{site.source === "demo" ? text.demoFormNote : site.settings.privacyCollectionEnabled ? null : text.liveClosedNote}</p>
      <div className="mt-6">
        <SubmitBanner lang={lang} submitted={sp.get("submitted") ?? undefined} error={sp.get("error") ?? undefined} />
        <EnhanceForm action="/api/requests/sell" lang={lang}>
          <input type="hidden" name="lang" value={lang} />
          <Field label={text.model} name="model" required />
          <Field label={text.modelYear} name="modelYear" />
          <Field label={text.mileage} name="mileageKm" />
          <Field label={text.location} name="location" required />
          <Field label={text.askingPrice} name="askingPriceAmount" type="number" />
          <label className="grid gap-1 text-sm font-medium">
            {text.currency}
            <select name="askingPriceCurrency" className="rounded-md border border-line px-3 py-2 font-normal" defaultValue="KRW">
              {["KRW", "USD", "EUR"].map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </label>
          <Field label={text.name} name="name" required />
          <Field label={text.email} name="email" type="email" />
          <Field label={text.contact} name="phone" />
          <Field label={text.message} name="message" as="textarea" />
          <label className="grid gap-1 text-sm font-medium">
            {text.photos}
            <input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="font-normal" />
          </label>
          <Consent lang={lang} />
          <Honeypot lang={lang} />
        </EnhanceForm>
      </div>
    </div>
  );
}
