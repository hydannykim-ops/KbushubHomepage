import Link from "next/link";
import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { Consent, EnhanceForm, Field, Honeypot, SubmitBanner } from "@/components/forms";
import { MakerModelPicker } from "@/components/maker-model-picker";
import { PhotoSlotUploader } from "@/components/photo-slot-uploader";
import { getSession } from "@/lib/auth/session";
import { copy } from "@/lib/i18n";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
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
  const ctx = await requestContext(lang, sp);
  const site = await loadSite();
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;
  const text = copy(lang);
  const session = await getSession();

  // Domestic purchase intake only — hide for overseas languages.
  if (lang !== "ko") {
    return (
      <div className="page-tone -mx-4 px-4 py-10" data-tone="sell">
        <div className="mx-auto max-w-xl">
          <p className="tone-text text-xs font-semibold tracking-[0.16em]">K-BUS HUB</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{text.sellTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{text.sellDomesticOnly}</p>
          <Link href={hrefTo(lang, "/vehicles", ctx)} className="tone-cta mt-6 inline-flex px-4 py-3 text-sm font-semibold text-white">
            {text.browseInventory}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-tone -mx-4 px-4 py-10" data-tone="sell">
      <div className="mx-auto grid max-w-xl gap-8">
        <div>
          <p className="tone-text text-xs font-semibold tracking-[0.16em]">K-BUS HUB</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{text.sellTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{text.sellLead}</p>
          <ul className="mt-4 grid gap-2 text-sm text-ink">
            <li className="flex gap-2">
              <span className="tone-dot mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              {text.consultBody}
            </li>
            <li className="flex gap-2">
              <span className="tone-dot-alt mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              {text.sellPhotoOptionalBody}
            </li>
          </ul>
        </div>

        <div id="consult" className="quote-card rounded-2xl border border-line bg-white p-5 shadow-[0_12px_36px_rgba(15,28,47,0.06)]">
          <h2 className="text-xl font-semibold">{text.consultTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{text.guestSellBody}</p>
          {site.source !== "demo" && !site.settings.privacyCollectionEnabled ? (
            <p className="mt-2 text-sm text-muted">{text.liveClosedNote}</p>
          ) : null}
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
                <select name="askingPriceCurrency" className="rounded-md border border-line bg-white px-3 py-2 font-normal" defaultValue="KRW">
                  {["KRW", "USD", "EUR"].map((currency) => (
                    <option key={currency}>{currency}</option>
                  ))}
                </select>
              </label>
              <Field label={text.name} name="name" required defaultValue={session?.name ?? ""} />
              <Field label={text.email} name="email" type="email" defaultValue={session?.email ?? ""} />
              <Field label={text.contact} name="phone" />
              <Field label={text.message} name="message" as="textarea" />
              <details className="rounded-xl border border-dashed border-line bg-[#f7f9fb] p-3 open:bg-white">
                <summary className="cursor-pointer list-none text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {text.sellPhotoOptionalTitle}
                  <span className="mt-1 block text-xs font-normal text-muted">{text.sellPhotoOptionalBody}</span>
                </summary>
                <div className="mt-4">
                  <PhotoSlotUploader lang={lang} optional />
                </div>
              </details>
              <Consent lang={lang} />
              <Honeypot lang={lang} />
            </EnhanceForm>
          </div>
        </div>
      </div>
    </div>
  );
}
