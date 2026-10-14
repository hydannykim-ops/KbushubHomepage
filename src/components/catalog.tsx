import Link from "next/link";
import { GalleryClient } from "./gallery-client";
import { formatKm, priceView, showText } from "@/lib/domain/money";
import type { Lang, PublicVehicle, TradeMode, VehiclePhoto, VehicleQuery } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { classLabel, fuelLabel, longBodyLabel, statusLabel, steeringLabel, transmissionLabel } from "@/lib/labels";
import { whatsappHref, whatsappMessage } from "@/lib/domain/referral";

export function DemoBanner({ lang }: { lang: Lang }) {
  return (
    <p className="bg-[#e8eef8] px-4 py-2 text-center text-sm text-foreground" role="status">
      {copy(lang).demoBanner}
    </p>
  );
}

export function DataProblem({ lang, code }: { lang: Lang; code: "misconfigured" | "upstream" }) {
  const text = copy(lang);
  return (
    <div className="mx-auto max-w-3xl px-4 py-16" role="alert">
      <h1 className="text-2xl font-bold">{text.loadError}</h1>
      <p className="mt-3 text-muted">{code === "misconfigured" ? text.misconfigured : text.upstream}</p>
    </div>
  );
}

function PhotoFrame({ vehicle, lang, large = false }: { vehicle: PublicVehicle; lang: Lang; large?: boolean }) {
  const text = copy(lang);
  const cover = vehicle.photos.find((photo) => photo.isCover) ?? vehicle.photos[0];
  return (
    <div className={`relative overflow-hidden bg-[#e7edf4] ${large ? "aspect-[16/10]" : "aspect-[16/10]"}`}>
      {cover && !cover.placeholder ? (
        // Access-checked photos are optimized in the media route.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/media/photo/${cover.id}`} alt={lang === "ko" ? cover.altKo : cover.altEn} className="h-full w-full object-cover" />
      ) : cover?.placeholder ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/demo/placeholder.svg" alt="" className="h-full w-full object-cover" />
          <span className="sr-only">{text.placeholderNote}</span>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted">{text.photoNone}</div>
      )}
      <span className="absolute left-3 top-3 rounded bg-white px-2 py-1 text-xs font-semibold">{statusLabel(vehicle.status, lang)}</span>
    </div>
  );
}

export function VehicleCard({
  vehicle,
  lang,
  mode,
  href,
}: {
  vehicle: PublicVehicle;
  lang: Lang;
  mode: TradeMode;
  href: string;
}) {
  const text = copy(lang);
  const price = priceView(vehicle, mode, lang);
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
      <Link href={href} className="block">
        <PhotoFrame vehicle={vehicle} lang={lang} />
        <div className="space-y-2 p-4">
          <p className="text-xs text-muted">
            {text.stockNo} {vehicle.stockNo}
          </p>
          <h2 className="text-lg font-bold">
            {vehicle.maker} {vehicle.model}
            {vehicle.trim ? ` ${vehicle.trim}` : ""}
          </h2>
          <p className="text-sm text-muted">
            {vehicle.modelYear ?? text.unknown} · {vehicle.seats ?? text.unknown}
            {lang === "ko" ? "인승" : " seats"}
          </p>
          <p className="text-sm text-muted">
            {formatKm(vehicle.mileageKm, lang)} · {transmissionLabel(vehicle.transmission, lang)}
          </p>
          <p className="text-xl font-bold tabular-nums">{price.primary}</p>
          {price.basis ? <p className="text-sm text-muted">{price.basis}</p> : null}
        </div>
      </Link>
    </article>
  );
}

export function Gallery({ photos, lang }: { photos: VehiclePhoto[]; lang: Lang }) {
  const text = copy(lang);
  if (!photos.length) {
    return <div className="flex aspect-[16/10] items-center justify-center rounded-lg border border-line bg-white text-muted">{text.photoNone}</div>;
  }
  return <GalleryClient photos={photos} lang={lang} />;
}

export function SpecTable({ vehicle, lang }: { vehicle: PublicVehicle; lang: Lang }) {
  const text = copy(lang);
  const dimension =
    vehicle.lengthMm || vehicle.widthMm || vehicle.heightMm
      ? `${vehicle.lengthMm ?? "-"} / ${vehicle.widthMm ?? "-"} / ${vehicle.heightMm ?? "-"} mm`
      : null;
  const rows: Array<[string, string]> = [
    [text.maker, vehicle.maker],
    [text.model, `${vehicle.model}${vehicle.trim ? ` / ${vehicle.trim}` : ""}`],
    [text.classLabel, classLabel(vehicle.vehicleClass, lang)],
    [text.year, vehicle.modelYear ? String(vehicle.modelYear) : text.unknown],
    [text.firstRegistered, showText(vehicle.firstRegisteredOn, lang)],
    [text.mileage, formatKm(vehicle.mileageKm, lang)],
    [text.seats, vehicle.seats ? String(vehicle.seats) : text.unknown],
    [text.transmission, transmissionLabel(vehicle.transmission, lang)],
    [text.fuel, fuelLabel(vehicle.fuel, lang)],
    [text.engine, showText(vehicle.engineModel, lang)],
    [text.displacement, vehicle.displacementCc ? `${vehicle.displacementCc.toLocaleString(lang === "ko" ? "ko-KR" : "en-US")} cc` : text.unknown],
    [text.steering, steeringLabel(vehicle.steering, lang)],
    [text.longBody, longBodyLabel(vehicle.longBody, lang)],
    [text.dimensions, dimension ?? text.unknown],
    [text.previousUse, showText(lang === "ko" ? vehicle.previousUseKo : vehicle.previousUseEn, lang)],
    [text.location, showText(vehicle.location, lang)],
    [text.photographed, showText(vehicle.photographedOn, lang)],
    [text.stockChecked, showText(vehicle.stockCheckedOn, lang)],
  ];
  return (
    <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="bg-white px-4 py-3">
          <dt className="text-xs text-muted">{label}</dt>
          <dd className="mt-1 text-sm font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function youtubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    if (parsed.hostname.endsWith("youtube.com") || parsed.hostname.endsWith("youtube-nocookie.com")) {
      return parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).at(-1) || null;
    }
  } catch {
    return null;
  }
  return null;
}

export function contactActions(input: {
  mode: TradeMode;
  phone: string | null;
  kakaoUrl: string | null;
  whatsappE164: string | null;
  stockNo: string;
  lang: Lang;
  referralCode: string | null;
}) {
  const message = whatsappMessage({ lang: input.lang, stockNo: input.stockNo, referralCode: input.referralCode });
  return {
    phone: input.phone,
    kakao: input.kakaoUrl,
    whatsapp: input.mode === "export" && input.whatsappE164 ? whatsappHref(input.whatsappE164, message) : null,
  };
}

export function sortHref(base: string, query: VehicleQuery, sort: string, ctx: { mode: TradeMode; ref: string | null }) {
  const params = new URLSearchParams();
  const set = (key: string, value: string | number | null | undefined) => {
    if (value == null || value === "") return;
    params.set(key, String(value));
  };
  set("q", query.q);
  set("maker", query.maker);
  set("model", query.model);
  set("class", query.vehicleClass);
  set("yearMin", query.yearMin);
  set("yearMax", query.yearMax);
  set("priceMin", query.priceMin);
  set("priceMax", query.priceMax);
  set("priceCurrency", query.priceCurrency);
  set("seatsMin", query.seatsMin);
  set("mileageMax", query.mileageMax);
  set("transmission", query.transmission);
  set("fuel", query.fuel);
  set("status", query.status);
  if (sort !== "newest") set("sort", sort);
  params.set("mode", ctx.mode);
  if (ctx.ref) params.set("ref", ctx.ref);
  return `${base}?${params.toString()}`;
}
