import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contactActions, DataProblem, Gallery, SpecTable, youtubeId } from "@/components/catalog";
import { MediaSlot } from "@/components/media-slot";
import { ExportInquiryFields } from "@/components/export-inquiry-fields";
import { Consent, EnhanceForm, Field, Honeypot, SubmitBanner } from "@/components/forms";
import { priceView, showText } from "@/lib/domain/money";
import { vehicleTitle } from "@/lib/domain/vehicle-catalog";
import { copy } from "@/lib/i18n";
import { contentFieldLang } from "@/lib/i18n/langs";
import { statusLabel, transferLabel } from "@/lib/labels";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";
import { getDataSource, siteUrl } from "@/lib/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; stockNo: string }>;
}): Promise<Metadata> {
  const { lang: raw, stockNo } = await params;
  const lang = parseLang(raw) ?? "ko";
  const site = await loadSite();
  if (!site.ok) return { title: stockNo, robots: { index: false, follow: false } };
  const vehicle = await site.repo.getPublicByStockNo(stockNo);
  if (!vehicle) return { title: stockNo, robots: { index: false, follow: false } };
  const title = `${vehicleTitle(vehicle, lang)} ${vehicle.modelYear ?? ""} ${vehicle.stockNo}`.replace(/\s+/g, " ").trim();
  const description = (contentFieldLang(lang) === "ko" ? vehicle.descriptionKo : vehicle.descriptionEn) || title;
  const cover = vehicle.photos.find((photo) => photo.isCover && !photo.placeholder);
  return {
    title,
    description,
    robots: getDataSource() === "supabase" ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description,
      images: cover ? [`${siteUrl()}/api/media/photo/${cover.id}`] : undefined,
    },
  };
}

export default async function VehicleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; stockNo: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: raw, stockNo } = await params;
  const lang = parseLang(raw);
  if (!lang) notFound();
  const rawParams = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(rawParams)) if (typeof value === "string") sp.set(key, value);
  const ctx = await requestContext(lang, sp);
  const text = copy(lang);
  const site = await loadSite();
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;
  const vehicle = await site.repo.getPublicByStockNo(stockNo);
  if (!vehicle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-bold">{text.notFound}</h1>
        <Link href={hrefTo(lang, "/vehicles", ctx)} className="mt-4 inline-block text-primary">
          {text.backToList}
        </Link>
      </div>
    );
  }
  const price = priceView(vehicle, ctx.mode, lang);
  const contacts = contactActions({
    mode: ctx.mode,
    phone: site.settings.phone,
    kakaoUrl: site.settings.kakaoUrl,
    whatsappE164: site.settings.whatsappE164,
    stockNo: vehicle.stockNo,
    lang,
    referralCode: ctx.ref,
  });
  const sold = vehicle.status === "sold";
  const field = contentFieldLang(lang);
  const description = field === "ko" ? vehicle.descriptionKo : vehicle.descriptionEn;
  const maintenance = field === "ko" ? vehicle.maintenanceKo : vehicle.maintenanceEn;
  const defects = field === "ko" ? vehicle.defectsKo : vehicle.defectsEn;
  const video = vehicle.videoUrl ? youtubeId(vehicle.videoUrl) : null;
  const kind = ctx.mode === "export" ? "quote" : "purchase";

  const inquiry = (
    <EnhanceForm action="/api/inquiries" lang={lang}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="tradeMode" value={ctx.mode} />
      <input type="hidden" name="stockNo" value={vehicle.stockNo} />
      <label className="grid gap-1 text-sm font-medium">
        {text.inquiry}
        <select name="kind" defaultValue={kind} className="rounded-md border border-line px-3 py-2 font-normal">
          {ctx.mode === "domestic" ? (
            <>
              <option value="purchase">{text.purchase}</option>
              <option value="visit">{text.visit}</option>
            </>
          ) : (
            <>
              <option value="quote">{text.quote}</option>
              <option value="video">{text.videoRequest}</option>
            </>
          )}
          <option value="general">{text.inquiry}</option>
        </select>
      </label>
      <Field label={text.name} name="name" required />
      <Field label={text.email} name="email" type="email" />
      <Field label={text.contact} name="phone" />
      <Field label={text.messenger} name="messenger" />
      <Field label={text.country} name="country" required defaultValue={ctx.mode === "domestic" ? "" : ""} />
      {ctx.mode === "export" ? <ExportInquiryFields lang={lang} /> : null}
      <Field label={text.message} name="message" as="textarea" required />
      <p className="text-xs text-muted">{text.requiredHint}</p>
      {ctx.ref ? <p className="text-xs text-muted">{text.referralKept}</p> : null}
      {site.source !== "demo" && !site.settings.privacyCollectionEnabled ? (
        <p className="text-xs text-muted">{text.liveClosedNote}</p>
      ) : null}
      <Consent lang={lang} />
      <Honeypot lang={lang} />
    </EnhanceForm>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 pb-28 md:pb-10">
      <SubmitBanner lang={lang} submitted={typeof rawParams.submitted === "string" ? rawParams.submitted : undefined} error={typeof rawParams.error === "string" ? rawParams.error : undefined} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <Gallery photos={vehicle.photos} lang={lang} />
        <aside className="border border-line bg-white p-5 lg:sticky lg:top-24">
          <p className="text-sm text-muted">
            {text.stockNo} {vehicle.stockNo}
          </p>
          <p className="mt-2 inline-block rounded bg-[#e8eef8] px-2 py-1 text-sm font-semibold">{statusLabel(vehicle.status, lang)}</p>
          <h1 className="mt-3 text-2xl font-bold">{vehicleTitle(vehicle, lang)}</h1>
          <p className="mt-2 text-sm text-muted">
            {[
              vehicle.location || text.unknown,
              ctx.mode === "domestic" ? transferLabel(vehicle.transferType, lang) : null,
              vehicle.seats != null ? `${vehicle.seats}${lang === "ko" ? text.seatsShort : ` ${text.seatsShort}`}` : null,
              vehicle.horsepowerPs != null ? (lang === "ko" ? `${vehicle.horsepowerPs}마력` : `${vehicle.horsepowerPs} PS`) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight">{price.primary}</p>
          {price.basis ? <p className="mt-1 text-sm text-muted">{price.basis}</p> : null}
          <p className="mt-2 text-xs text-muted">
            {text.photographed}: {vehicle.photographedOn ?? text.unknown} · {text.stockChecked}: {vehicle.stockCheckedOn ?? text.unknown}
          </p>
          {ctx.mode === "export" ? <p className="mt-2 text-xs leading-5 text-muted">{text.exportQuoteNote}</p> : null}
          {sold ? <p className="mt-3 text-sm">{text.soldNote}</p> : null}
          {vehicle.status === "reserved" ? <p className="mt-3 text-sm">{text.reservedNote}</p> : null}
          {!sold ? (
            <div className="mt-4 grid gap-2">
              <a href="#inquiry" className="rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-white">
                {ctx.mode === "export" ? text.quote : text.purchase}
              </a>
              <a href="#inquiry" className="rounded-md border border-line px-4 py-3 text-center text-sm font-semibold">
                {ctx.mode === "export" ? text.videoRequest : text.visit}
              </a>
            </div>
          ) : (
            <Link href={hrefTo(lang, "/wanted", ctx, { model: vehicle.model })} className="mt-4 inline-flex rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white">
              {text.similar}
            </Link>
          )}
          <div className="mt-4 grid gap-2 text-sm">
            {ctx.mode === "domestic" ? (
              contacts.phone ? (
                <a className="rounded-md border border-line px-3 py-2" href={`tel:${contacts.phone}`}>
                  {text.phone} {contacts.phone}
                </a>
              ) : (
                <p className="text-muted">{text.contactMissing}</p>
              )
            ) : null}
            {ctx.mode === "domestic" && contacts.kakao ? (
              <a className="rounded-md border border-line px-3 py-2" href={contacts.kakao} rel="noreferrer">
                {text.kakao}
              </a>
            ) : null}
            {ctx.mode === "export" ? (
              contacts.whatsapp ? (
                <a className="rounded-md border border-line px-3 py-2" href={contacts.whatsapp} rel="noreferrer">
                  {text.whatsapp}
                </a>
              ) : (
                <p className="text-muted">{text.contactMissing}</p>
              )
            ) : null}
            {ctx.mode === "export" && contacts.whatsapp ? <p className="text-xs text-muted">{text.whatsappNote}</p> : null}
          </div>
        </aside>
      </div>
      <section>
        <h2 className="mb-3 text-xl font-bold">{text.specs}</h2>
        <SpecTable vehicle={vehicle} lang={lang} />
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-line bg-white p-5">
          <h2 className="font-bold">{text.maintenance}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{showText(maintenance, lang)}</p>
        </article>
        <article className="rounded-lg border border-line bg-white p-5">
          <h2 className="font-bold">{text.defects}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{showText(defects, lang)}</p>
        </article>
      </section>
      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="font-bold">{text.description}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{showText(description, lang)}</p>
      </section>
      <section className="border border-line bg-white p-5">
        <h2 className="font-semibold">{text.video}</h2>
        {vehicle.videoUrl && video ? (
          <iframe
            className="mt-3 aspect-video w-full"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video)}?autoplay=0`}
            title={vehicle.stockNo}
            allow="fullscreen"
          />
        ) : vehicle.videoUrl ? (
          <a className="mt-3 inline-block text-primary" href={vehicle.videoUrl} rel="noreferrer">
            {text.videoLink}
          </a>
        ) : (
          <div className="mt-3 aspect-video overflow-hidden border border-line">
            <MediaSlot label={text.mediaVideo} hint={text.mediaVideoHint} />
          </div>
        )}
      </section>
      <section id="inquiry" className="rounded-lg border border-line bg-white p-5">
        <h2 className="mb-4 text-xl font-bold">{sold ? text.similar : text.inquiry}</h2>
        {sold ? (
          <Link href={hrefTo(lang, "/wanted", ctx, { model: vehicle.model })} className="text-primary">
            {text.similar}
          </Link>
        ) : (
          inquiry
        )}
      </section>
      {!sold ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 md:hidden">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2">
            <a href="#inquiry" className="rounded-md bg-primary px-3 py-3 text-center text-sm font-semibold text-white">
              {ctx.mode === "export" ? text.quote : text.purchase}
            </a>
            <a href="#inquiry" className="rounded-md border border-line px-3 py-3 text-center text-sm font-semibold">
              {ctx.mode === "export" ? text.videoRequest : text.visit}
            </a>
          </div>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 md:hidden">
          <Link href={hrefTo(lang, "/wanted", ctx, { model: vehicle.model })} className="block rounded-md bg-primary px-3 py-3 text-center text-sm font-semibold text-white">
            {text.similar}
          </Link>
        </div>
      )}
    </div>
  );
}
