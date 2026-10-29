import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { Consent, EnhanceForm, Field, Honeypot, SubmitBanner } from "@/components/forms";
import { copy } from "@/lib/i18n";
import { parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

export default async function PartnerPage({
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
      <h1 className="text-3xl font-bold">{text.partnerTitle}</h1>
      <p className="mt-2 text-sm leading-6 text-muted">{text.partnerBody}</p>
      <p className="mt-2 text-sm leading-6">{text.partnerNote}</p>
      <div className="mt-6">
        <SubmitBanner lang={lang} submitted={sp.get("submitted") ?? undefined} error={sp.get("error") ?? undefined} />
        <EnhanceForm action="/api/agents/apply" lang={lang}>
          <input type="hidden" name="lang" value={lang} />
          <Field label={text.name} name="name" required />
          <Field label={lang === "ko" ? "회사" : "Company"} name="company" />
          <Field label={text.country} name="country" required />
          <Field label={text.email} name="email" type="email" required />
          <Field label={text.contact} name="phone" />
          <Field label={text.message} name="message" as="textarea" />
          <Consent lang={lang} />
          <Honeypot lang={lang} />
        </EnhanceForm>
      </div>
    </div>
  );
}
