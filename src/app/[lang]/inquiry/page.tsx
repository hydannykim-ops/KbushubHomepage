import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { Consent, EnhanceForm, Field, Honeypot, SubmitBanner } from "@/components/forms";
import { InquiryKindFields } from "@/components/inquiry-kind-fields";
import { getSession } from "@/lib/auth/session";
import { inquiryTradeModeForCountry, isKoreaCountry } from "@/lib/domain/country";
import type { InquiryKind } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { parseLang } from "@/lib/request-context";
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
  const site = await loadSite();
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;
  const text = copy(lang);
  const session = await getSession();
  const member =
    session && (session.role === "customer" || session.role === "dealer")
      ? await site.repo.getMember(session.sub)
      : null;
  const allowExport = !member || !isKoreaCountry(member.country);
  const defaultTradeMode = member ? inquiryTradeModeForCountry(member.country) : "domestic";
  const kindParam = sp.get("kind");
  const defaultKind: InquiryKind =
    kindParam === "purchase" || kindParam === "visit" || kindParam === "quote" || kindParam === "video" || kindParam === "general"
      ? kindParam
      : defaultTradeMode === "export"
        ? "quote"
        : "general";

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold">{text.inquiry}</h1>
      {site.source !== "demo" && !site.settings.privacyCollectionEnabled ? (
        <p className="mt-2 text-sm text-muted">{text.liveClosedNote}</p>
      ) : null}
      {member && allowExport ? <p className="mt-2 text-sm text-muted">{text.exportMemberNote}</p> : null}
      <div className="mt-6">
        <SubmitBanner lang={lang} submitted={sp.get("submitted") ?? undefined} error={sp.get("error") ?? undefined} />
        <EnhanceForm action="/api/inquiries" lang={lang}>
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="stockNo" value={sp.get("stock") ?? ""} />
          <InquiryKindFields
            lang={lang}
            defaultKind={defaultKind}
            defaultTradeMode={defaultTradeMode}
            allowExport={allowExport}
          />
          <Field label={text.name} name="name" required defaultValue={member?.name ?? ""} />
          <Field label={text.email} name="email" type="email" defaultValue={member?.email ?? ""} />
          <Field label={text.contact} name="phone" defaultValue={member?.phone ?? ""} />
          <Field label={text.messenger} name="messenger" />
          <Field label={text.country} name="country" required defaultValue={member?.country ?? ""} />
          <Field label={text.message} name="message" as="textarea" required />
          <Consent lang={lang} />
          <Honeypot lang={lang} />
        </EnhanceForm>
      </div>
    </div>
  );
}
