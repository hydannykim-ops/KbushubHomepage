import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { ExportInquiryFields } from "@/components/export-inquiry-fields";
import { Consent, EnhanceForm, Field, Honeypot, SubmitBanner } from "@/components/forms";
import { copy } from "@/lib/i18n";
import { parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

export default async function InquiryPage({
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
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold">{text.inquiry}</h1>
      <p className="mt-2 text-sm text-muted">{site.source === "demo" ? text.demoFormNote : site.settings.privacyCollectionEnabled ? null : text.liveClosedNote}</p>
      <div className="mt-6">
        <SubmitBanner lang={lang} submitted={sp.get("submitted") ?? undefined} error={sp.get("error") ?? undefined} />
        <EnhanceForm action="/api/inquiries" lang={lang}>
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="tradeMode" value={ctx.mode} />
          <input type="hidden" name="stockNo" value={sp.get("stock") ?? ""} />
          <label className="grid gap-1 text-sm font-medium">
            {text.inquiry}
            <select name="kind" defaultValue={sp.get("kind") ?? "general"} className="rounded-md border border-line px-3 py-2 font-normal">
              <option value="general">{text.inquiry}</option>
              <option value="purchase">{text.purchase}</option>
              <option value="visit">{text.visit}</option>
              <option value="quote">{text.quote}</option>
              <option value="video">{text.videoRequest}</option>
            </select>
          </label>
          <Field label={text.name} name="name" required />
          <Field label={text.email} name="email" type="email" />
          <Field label={text.contact} name="phone" />
          <Field label={text.messenger} name="messenger" />
          <Field label={text.country} name="country" required />
          {ctx.mode === "export" ? <ExportInquiryFields lang={lang} /> : null}
          <Field label={text.message} name="message" as="textarea" required />
          <Consent lang={lang} />
          <Honeypot lang={lang} />
        </EnhanceForm>
      </div>
    </div>
  );
}
