import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contactActions, DataProblem, Gallery, SpecTable } from "@/components/catalog";
import { ContactPhonePanel } from "@/components/contact-phone-panel";
import { SubmitBanner } from "@/components/forms";
import { getSession } from "@/lib/auth/session";
import { inquiryTradeModeForCountry } from "@/lib/domain/country";
import { catalogPriceView, formatKm, showText } from "@/lib/domain/money";
import { vehicleTitle } from "@/lib/domain/vehicle-catalog";
import { copy } from "@/lib/i18n";
import { contentFieldLang } from "@/lib/i18n/langs";
import { fuelLabel, statusLabel, transferLabel, transmissionLabel } from "@/lib/labels";
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
  const listedBy = vehicle.listingCompany ?? site.settings.companyName;
  const price = catalogPriceView(vehicle, lang, listedBy);
  const session = await getSession();
  const signedIn = Boolean(session && (session.role === "customer" || session.role === "dealer"));
  const member = signedIn && session ? await site.repo.getMember(session.sub) : null;
  const inquiryMode = inquiryTradeModeForCountry(member?.country);
  const contacts = contactActions({
    mode: inquiryMode,
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
  const contactPhone = site.settings.phone ?? site.settings.whatsappE164;
  const ctaLabel = inquiryMode === "export" ? text.quote : text.purchase;
  const openConsult = sp.get("consult") === "1" || typeof rawParams.submitted === "string";
  const yearLabel = vehicle.modelYear ? (lang === "ko" ? `${vehicle.modelYear}년` : String(vehicle.modelYear)) : text.unknown;
  const factLine = [
    yearLabel,
    formatKm(vehicle.mileageKm, lang),
    vehicle.fuel !== "unknown" ? fuelLabel(vehicle.fuel, lang) : null,
    vehicle.transmission !== "unknown" ? transmissionLabel(vehicle.transmission, lang) : null,
    vehicle.seats != null ? `${vehicle.seats}${lang === "ko" ? text.seatsShort : ` ${text.seatsShort}`}` : null,
    vehicle.location || null,
  ]
    .filter(Boolean)
    .join(" · ");
  const sellerName = listedBy?.trim() || site.settings.companyName;
  const sellerKind = vehicle.listingCompany ? text.dealerListing : text.companyListing;
  const showTransfer = vehicle.transferType !== "unknown";

  return (
    <div className="mx-auto grid max-w-6xl gap-7 px-4 py-7 pb-28 md:pb-10">
      <SubmitBanner lang={lang} submitted={typeof rawParams.submitted === "string" ? rawParams.submitted : undefined} error={typeof rawParams.error === "string" ? rawParams.error : undefined} />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.78fr)] lg:gap-6">
        <Gallery photos={vehicle.photos} lang={lang} />

        <aside className="vehicle-summary lg:sticky lg:top-24">
          <div className="vehicle-summary__block">
            <p className="text-xs text-muted">
              {text.stockNo} {vehicle.stockNo}
            </p>
            <p className="mt-2 inline-flex bg-[#e8eef8] px-2 py-1 text-xs font-semibold text-ink">{statusLabel(vehicle.status, lang)}</p>
            <h1 className="mt-2.5 text-[1.35rem] font-bold leading-snug tracking-tight text-ink">{vehicleTitle(vehicle, lang)}</h1>
            <p className="mt-2 text-sm leading-6 text-muted">{factLine}</p>
            {showTransfer ? (
              <div className="mt-3">
                <p className="vehicle-summary__label">{text.transferMode}</p>
                <span className="vehicle-summary__transfer">{transferLabel(vehicle.transferType, lang)}</span>
              </div>
            ) : null}
          </div>

          <div className="vehicle-summary__block">
            <p className="vehicle-summary__label">{text.priceSection}</p>
            <p className="vehicle-summary__price tabular-nums">{price.primary}</p>
            {price.basis ? <p className="mt-1 text-xs text-muted">{price.basis}</p> : null}
            {price.exportLine ? <p className="mt-2 text-xs leading-5 text-muted">{text.modeExport}: {price.exportLine}</p> : null}
            {inquiryMode === "export" ? <p className="mt-2 text-xs leading-5 text-muted">{text.exportQuoteNote}</p> : null}
            {sold ? <p className="mt-2 text-sm text-ink">{text.soldNote}</p> : null}
            {vehicle.status === "reserved" ? <p className="mt-2 text-sm text-ink">{text.reservedNote}</p> : null}
          </div>

          <div className="vehicle-summary__block">
            <p className="vehicle-summary__label">{text.sellerSection}</p>
            <p className="vehicle-summary__seller-name">{sellerName}</p>
            <p className="mt-1 text-xs text-muted">{sellerKind}</p>
            {vehicle.location ? <p className="mt-1 text-sm text-muted">{vehicle.location}</p> : null}
            <div className="mt-3 grid gap-2 text-sm">
              {contacts.phone && contacts.phoneHref ? (
                <a className="border border-line px-3 py-2 hover:border-ink" href={contacts.phoneHref}>
                  {text.phone} {contacts.phone}
                </a>
              ) : null}
              {contacts.kakao ? (
                <a className="border border-line px-3 py-2 hover:border-ink" href={contacts.kakao} rel="noreferrer">
                  {text.kakao}
                </a>
              ) : null}
              {contacts.whatsapp ? (
                <a className="border border-line px-3 py-2 hover:border-ink" href={contacts.whatsapp} rel="noreferrer">
                  {text.whatsapp} {contacts.phone ?? ""}
                </a>
              ) : null}
              {contacts.whatsapp ? <p className="text-xs text-muted">{text.whatsappNote}</p> : null}
              {!contacts.phone && !contacts.kakao && !contacts.whatsapp ? <p className="text-muted">{text.contactMissing}</p> : null}
            </div>
          </div>

          <div className="vehicle-summary__block">
            {!sold ? (
              <ContactPhonePanel
                lang={lang}
                phone={contactPhone}
                ctaLabel={ctaLabel}
                autoOpen={openConsult}
                stockNo={vehicle.stockNo}
                signedIn={signedIn}
              />
            ) : (
              <Link href={hrefTo(lang, "/wanted", ctx, { model: vehicle.model })} className="inline-flex w-full justify-center bg-primary px-4 py-3 text-sm font-semibold text-white">
                {text.similar}
              </Link>
            )}
          </div>
        </aside>
      </div>

      <section className="border border-line bg-white px-4 py-5 sm:px-5">
        <h2 className="text-base font-semibold text-ink">{text.specs}</h2>
        <div className="mt-4">
          <SpecTable vehicle={vehicle} lang={lang} />
        </div>
      </section>

      <section className="grid gap-6 border border-line bg-white px-4 py-5 sm:px-5 md:grid-cols-2">
        <article>
          <h2 className="text-base font-semibold text-ink">{text.maintenance}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{showText(maintenance, lang)}</p>
        </article>
        <article>
          <h2 className="text-base font-semibold text-ink">{text.defects}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{showText(defects, lang)}</p>
        </article>
      </section>

      <section className="border border-line bg-white px-4 py-5 sm:px-5">
        <h2 className="text-base font-semibold text-ink">{text.description}</h2>
        <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-muted">{showText(description, lang)}</p>
      </section>

      {!sold ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 md:hidden">
          <div className="mx-auto max-w-6xl">
            <a href="#inquiry" className="block bg-primary px-3 py-3 text-center text-sm font-semibold text-white">
              {ctaLabel}
            </a>
          </div>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 md:hidden">
          <Link href={hrefTo(lang, "/wanted", ctx, { model: vehicle.model })} className="block bg-primary px-3 py-3 text-center text-sm font-semibold text-white">
            {text.similar}
          </Link>
        </div>
      )}
    </div>
  );
}
