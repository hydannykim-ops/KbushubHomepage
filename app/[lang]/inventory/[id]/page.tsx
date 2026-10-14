import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyLink } from "@/components/copy-link";
import { Gallery } from "@/components/gallery";
import { InquiryForm } from "@/components/inquiry-form";
import { ListingCard } from "@/components/listing-card";
import { PriceBlock } from "@/components/price-block";
import { StatusBadge } from "@/components/status-badge";
import { PhotoFrame } from "@/components/photo-frame";
import { phoneLink, safeHttpUrl, textOf, vehicleTitle, whatsappLink, whatsappText } from "@/lib/domain";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor, siteUrl } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { publicData } from "@/lib/store";
import { btnPrimary, btnSecondary, panel } from "@/lib/ui";
import type { InquiryKind, Locale } from "@/lib/types";
import { headers } from "next/headers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const data = await publicData();
  const vehicle = data.ok ? data.vehicles.find((item) => item.id === id && item.status !== "hidden") : null;
  if (!vehicle || !isLocale(lang)) return { title: "K-BUS HUB", robots: { index: false, follow: false } };
  const title = vehicleTitle(vehicle, lang);
  return {
    title,
    description: textOf(vehicle.description, lang, title),
    openGraph: { title, description: textOf(vehicle.description, lang, title) },
  };
}

function show(value: string | number | null | undefined, unknown: string) {
  if (value == null || value === "") return unknown;
  return String(value);
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const lang: Locale = raw;
  const trade = await tradeMode();
  const data = await publicData();
  if (!data.ok) return null;
  const vehicle = data.vehicles.find((item) => item.id === id && item.status !== "hidden");
  if (!vehicle) notFound();
  const dict = getDict(lang);
  const title = vehicleTitle(vehicle, lang);
  const ref = (await headers()).get("x-kb-ref");
  const phone = phoneLink(data.settings.phone);
  const kakao = safeHttpUrl(data.settings.kakaoUrl);
  const whatsapp = whatsappLink(data.settings.whatsapp, whatsappText(vehicle.id, ref));
  const kinds: InquiryKind[] = trade === "export" ? ["quote", "video", "similar", "general"] : ["purchase", "visit", "similar", "general"];
  const defaultKind: InquiryKind = vehicle.status === "sold" ? "similar" : kinds[0];
  const unknown = dict.common.unknown;
  const rows: [string, string][] = [
    [dict.detail.stock, vehicle.id],
    [dict.detail.maker, textOf(vehicle.manufacturer, lang, unknown)],
    [dict.detail.model, textOf(vehicle.model, lang, unknown)],
    [dict.detail.trim, textOf(vehicle.trim, lang, unknown)],
    [dict.detail.year, String(vehicle.year)],
    [dict.detail.registered, show(vehicle.firstRegistered, unknown)],
    [dict.detail.mileage, vehicle.mileageKm == null ? unknown : `${vehicle.mileageKm.toLocaleString(lang === "ko" ? "ko-KR" : "en-US")} km`],
    [dict.detail.seats, show(vehicle.seats, unknown)],
    [dict.detail.transmission, dict.transmission[vehicle.transmission]],
    [dict.detail.fuel, dict.fuel[vehicle.fuel]],
    [dict.detail.engine, show(vehicle.engineModel, unknown)],
    [dict.detail.displacement, vehicle.displacementCc == null ? unknown : `${vehicle.displacementCc.toLocaleString()} cc`],
    [dict.detail.steering, dict.steering[vehicle.steering]],
    [dict.detail.longBody, vehicle.longBody == null ? unknown : vehicle.longBody ? dict.common.yes : dict.common.no],
    [dict.detail.length, vehicle.lengthMm == null ? unknown : `${vehicle.lengthMm.toLocaleString()} mm`],
    [dict.detail.width, vehicle.widthMm == null ? unknown : `${vehicle.widthMm.toLocaleString()} mm`],
    [dict.detail.height, vehicle.heightMm == null ? unknown : `${vehicle.heightMm.toLocaleString()} mm`],
    [dict.detail.use, textOf(vehicle.previousUse, lang, unknown)],
    [dict.detail.location, textOf(vehicle.location, lang, unknown)],
    [dict.detail.shot, show(vehicle.photographedAt, unknown)],
    [dict.detail.checked, show(vehicle.stockCheckedAt, unknown)],
  ];
  const similar = data.vehicles.filter((item) => item.class === vehicle.class && item.id !== vehicle.id && item.status !== "hidden").slice(0, 2);
  const share = `${siteUrl()}${hrefFor(lang, `/inventory/${vehicle.id}`, trade, ref ? { ref } : undefined)}`;

  return (
    <article className="mx-auto max-w-7xl px-5 py-12 pb-32 lg:px-8 lg:pb-16">
      <p className="text-sm text-muted">
        <Link href={hrefFor(lang, "/inventory", trade)}>{dict.nav.inventory}</Link>
        <span> / {vehicle.id}</span>
      </p>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-wide text-muted">{vehicle.id} · {dict.common.sample}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] md:text-5xl">{title}</h1>
        </div>
        <StatusBadge status={vehicle.status} lang={lang} />
      </div>
      {vehicle.status === "sold" ? <p className={`${panel} mt-5 px-4 py-3 text-sm`}>{dict.detail.sold}</p> : null}
      {vehicle.status === "reserved" ? <p className={`${panel} mt-5 px-4 py-3 text-sm`}>{dict.detail.reserved}</p> : null}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Gallery photos={vehicle.photos} lang={lang} variant={vehicle.class} />
        <aside className={`${panel} p-6 lg:sticky lg:top-28`}>
          <PriceBlock vehicle={vehicle} trade={trade} lang={lang} large />
          <div className="mt-5 grid gap-2">
            <a className={btnPrimary} href="#inquiry">{dict.detail.inquiry}</a>
            {vehicle.status === "sold" ? (
              <Link className={btnSecondary} href={hrefFor(lang, "/request", trade, { model: title })}>{dict.kind.similar}</Link>
            ) : null}
          </div>
          <div className="mt-4 grid gap-2">
            {phone ? <a className={btnSecondary} href={phone}>{dict.detail.phone}</a> : null}
            {kakao ? <a className={btnSecondary} href={kakao}>{dict.detail.kakao}</a> : null}
            {whatsapp ? <a className={btnSecondary} href={whatsapp}>{dict.detail.whatsapp}</a> : null}
            {!phone && !kakao && !whatsapp ? <p className="text-sm leading-6 text-muted">{dict.detail.noContact}</p> : null}
          </div>
          <div className="mt-4">
            <CopyLink href={share} label={dict.common.share} copied={dict.common.copied} show={dict.common.showLink} />
          </div>
        </aside>
      </div>
      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">{dict.detail.specs}</h2>
        <dl className={`${panel} mt-5 px-5`}>
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-1 gap-1 border-b border-line/80 py-3.5 text-sm last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)]">
              <dt className="text-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className={`${panel} p-6`}>
          <h2 className="font-semibold">{dict.detail.maintenance}</h2>
          <p className="mt-2 text-sm leading-6">{textOf(vehicle.maintenance, lang, unknown)}</p>
        </div>
        <div className={`${panel} border-l-4 border-l-[#8a5a00] p-6`}>
          <h2 className="font-semibold">{dict.detail.defects}</h2>
          <p className="mt-2 text-sm leading-6">{textOf(vehicle.knownDefects, lang, unknown)}</p>
        </div>
      </section>
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">{dict.detail.about}</h2>
        <p className="mt-4 max-w-3xl text-base leading-7">{textOf(vehicle.description, lang, unknown)}</p>
      </section>
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">{dict.detail.video}</h2>
        <p className="mt-2 text-sm text-muted">{dict.detail.videoBody}</p>
        <div className="mt-4 overflow-hidden rounded-[1.25rem]">
          <PhotoFrame kicker={dict.common.slotVideo} caption={dict.detail.noVideo} aspect="aspect-video" />
        </div>
        {vehicle.videoUrl === "demo" ? (
          <Link className="mt-4 inline-flex text-sm font-semibold text-blue" href={hrefFor(lang, "/demo/video", trade)}>
            {dict.detail.videoDemo}
          </Link>
        ) : vehicle.videoUrl && safeHttpUrl(vehicle.videoUrl) ? (
          <a className="mt-4 inline-flex text-sm font-semibold text-blue" href={safeHttpUrl(vehicle.videoUrl)!}>
            {dict.detail.video}
          </a>
        ) : null}
      </section>
      <section id="inquiry" className={`${panel} mt-14 scroll-mt-28 p-6 md:p-8`}>
        <h2 className="text-xl font-semibold">{dict.detail.inquiry}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{dict.detail.formLead}</p>
        <div className="mt-5">
          <InquiryForm lang={lang} trade={trade} vehicleId={vehicle.id} kinds={kinds} defaultKind={defaultKind} />
        </div>
      </section>
      {similar.length ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">{dict.detail.similar}</h2>
          <div className="mt-4 grid gap-4">
            {similar.map((item) => (
              <ListingCard key={item.id} vehicle={item} lang={lang} trade={trade} />
            ))}
          </div>
        </section>
      ) : null}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <PriceBlock vehicle={vehicle} trade={trade} lang={lang} />
          <a href="#inquiry" className={btnPrimary}>{dict.detail.inquiry}</a>
        </div>
      </div>
    </article>
  );
}
