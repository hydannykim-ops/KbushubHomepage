import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { Consent, EnhanceForm, Field, Honeypot, SubmitBanner } from "@/components/forms";
import { MakerModelPicker } from "@/components/maker-model-picker";
import { PhotoSlotUploader } from "@/components/photo-slot-uploader";
import { getSession } from "@/lib/auth/session";
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
  const session = await getSession();

  const consult = (
    <div id="consult" className="border border-line bg-white p-5">
      <h2 className="text-xl font-semibold">{text.navSell}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{text.consultBody}</p>
      <div className="mt-5">
        <SubmitBanner lang={lang} submitted={sp.get("submitted") ?? undefined} error={sp.get("error") ?? undefined} />
        <EnhanceForm action="/api/requests/sell" lang={lang}>
          <input type="hidden" name="lang" value={lang} />
          <MakerModelPicker lang={lang} required />
          <Field label={text.modelYear} name="modelYear" />
          <Field label={text.mileage} name="mileageKm" />
          <Field label={text.location} name="location" required />
          <Field label={text.askingPrice} name="askingPriceAmount" type="number" />
          <label className="grid gap-1 text-sm font-medium">
            {text.currency}
            <select name="askingPriceCurrency" className="border border-line bg-white px-3 py-2 font-normal" defaultValue="KRW">
              {["KRW", "USD", "EUR"].map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </label>
          <Field label={text.name} name="name" required defaultValue={session?.name ?? ""} />
          <Field label={text.email} name="email" type="email" defaultValue={session?.email ?? ""} />
          <Field label={text.contact} name="phone" />
          <Field label={text.message} name="message" as="textarea" />
          <PhotoSlotUploader lang={lang} />
          <Consent lang={lang} />
          <Honeypot lang={lang} />
        </EnhanceForm>
      </div>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-xl gap-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{text.sellTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{text.consultBody}</p>
      </div>
      {consult}
    </div>
  );
}
