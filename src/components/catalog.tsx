import Link from "next/link";
import { MediaSlot } from "./media-slot";
import { GalleryClient } from "./gallery-client";
import { formatKm, priceView } from "@/lib/domain/money";
import type { Lang, PublicVehicle, TradeMode, VehiclePhoto, VehicleQuery } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { contentFieldLang, localeTag } from "@/lib/i18n/langs";
import { makerLabel, modelLabel, vehicleTitle } from "@/lib/domain/vehicle-catalog";
import { classLabel, fuelLabel, statusLabel, transferLabel, transmissionLabel } from "@/lib/labels";
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

function photoSrc(photo: VehiclePhoto): string | null {
  if (!photo.placeholder) return `/api/media/photo/${photo.id}`;
  return photo.path;
}

function PhotoFrame({ vehicle, lang }: { vehicle: PublicVehicle; lang: Lang }) {
  const text = copy(lang);
  const cover = vehicle.photos.find((photo) => photo.isCover) ?? vehicle.photos[0];
  const src = cover ? photoSrc(cover) : null;
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[#eef1f5]">
      {src ? (
        // Demo samples are public files; uploaded photos go through the media route.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={contentFieldLang(lang) === "ko" ? cover!.altKo : cover!.altEn} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      ) : (
        <MediaSlot label={text.mediaCover} hint={text.mediaCoverHint} />
      )}
      {vehicle.status !== "available" ? (
        <span className="absolute left-3 top-3 bg-white/95 px-2 py-1 text-xs font-semibold text-ink">{statusLabel(vehicle.status, lang)}</span>
      ) : null}
    </div>
  );
}

export function VehicleCard({
  vehicle,
  lang,
  mode,
  href,
  listedBy,
}: {
  vehicle: PublicVehicle;
  lang: Lang;
  mode: TradeMode;
  href: string;
  listedBy?: string | null;
}) {
  const text = copy(lang);
  const price = priceView(vehicle, mode, lang, vehicle.listingCompany ?? listedBy);
  const yearLabel = vehicle.modelYear ? (lang === "ko" ? `${vehicle.modelYear}년` : String(vehicle.modelYear)) : text.unknown;
  const seatsLabel =
    vehicle.seats != null ? `${vehicle.seats}${lang === "ko" ? text.seatsShort : ` ${text.seatsShort}`}` : text.unknown;
  const hpLabel =
    vehicle.horsepowerPs != null
      ? lang === "ko"
        ? `${vehicle.horsepowerPs}마력`
        : `${vehicle.horsepowerPs} PS`
      : null;
  const meta = [yearLabel, formatKm(vehicle.mileageKm, lang), seatsLabel, hpLabel].filter(Boolean).join(" · ");
  const transfer = transferLabel(vehicle.transferType, lang);
  return (
    <article className="group overflow-hidden">
      <Link href={href} className="block">
        <PhotoFrame vehicle={vehicle} lang={lang} />
        <div className="space-y-2 pt-3">
          <h2 className="text-[1.05rem] font-semibold leading-snug tracking-tight text-ink">
            {vehicleTitle(vehicle, lang, { includeTrim: false })}
            {vehicle.trim ? (
              <span className="mt-1 block text-sm font-medium text-muted">{vehicle.trim}</span>
            ) : null}
          </h2>
          <p className="text-sm text-muted">{meta}</p>
          <p className="text-sm text-muted">
            {vehicle.location ? vehicle.location : text.unknown}
            {mode === "domestic" ? ` · ${transfer}` : null}
          </p>
          <div className="flex flex-wrap items-end gap-2 pt-0.5">
            <p className="text-2xl font-bold tabular-nums tracking-tight text-ink">{price.primary}</p>
            {vehicle.status !== "available" ? (
              <span className="mb-0.5 text-xs font-semibold text-muted">{statusLabel(vehicle.status, lang)}</span>
            ) : null}
          </div>
          {price.basis ? <p className="text-sm text-muted">{price.basis}</p> : null}
        </div>
      </Link>
    </article>
  );
}

export function Gallery({ photos, lang }: { photos: VehiclePhoto[]; lang: Lang }) {
  const text = copy(lang);
  if (!photos.length) {
    return (
      <div className="aspect-[16/10] overflow-hidden border border-line bg-white">
        <MediaSlot label={text.mediaCover} hint={text.photoNone} />
      </div>
    );
  }
  return <GalleryClient photos={photos} lang={lang} />;
}

export function SpecTable({ vehicle, lang }: { vehicle: PublicVehicle; lang: Lang }) {
  const text = copy(lang);
  const maker = makerLabel(vehicle.maker, lang);
  const model = `${modelLabel(vehicle.model, lang)}${vehicle.trim ? ` ${vehicle.trim}` : ""}`;
  const year = vehicle.modelYear ? String(vehicle.modelYear) : text.unknown;
  const mileage = formatKm(vehicle.mileageKm, lang);
  const horsepower =
    vehicle.horsepowerPs != null
      ? lang === "ko"
        ? `${vehicle.horsepowerPs}마력`
        : `${vehicle.horsepowerPs.toLocaleString(localeTag(lang))} PS`
      : null;

  const secondary: Array<[string, string]> = [
    [text.classLabel, classLabel(vehicle.vehicleClass, lang)],
    vehicle.seats != null ? [text.seats, String(vehicle.seats)] : null,
    horsepower ? [text.horsepower, horsepower] : null,
    vehicle.transmission !== "unknown" ? [text.transmission, transmissionLabel(vehicle.transmission, lang)] : null,
    vehicle.fuel !== "unknown" ? [text.fuel, fuelLabel(vehicle.fuel, lang)] : null,
    vehicle.transferType !== "unknown" ? [text.transferType, transferLabel(vehicle.transferType, lang)] : null,
    vehicle.location ? [text.location, vehicle.location] : null,
  ].filter((row): row is [string, string] => Boolean(row));

  return (
    <div className="border border-line bg-white">
      <div className="grid gap-6 border-b border-line px-5 py-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted">{text.maker}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{maker}</p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted">{text.model}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{model}</p>
        </div>
      </div>

      <div className="grid gap-px bg-line sm:grid-cols-2">
        <div className="bg-white px-5 py-5">
          <p className="text-xs font-medium tracking-wide text-muted">{text.year}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-ink">{year}</p>
        </div>
        <div className="bg-white px-5 py-5">
          <p className="text-xs font-medium tracking-wide text-muted">{text.mileage}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-ink">{mileage}</p>
        </div>
      </div>

      {secondary.length ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line px-5 py-4 sm:grid-cols-3">
          {secondary.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] text-muted">{label}</dt>
              <dd className="mt-0.5 text-sm text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
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
  const message = whatsappMessage({ lang: input.lang, stockNo: input.stockNo, referralCode: input.referralCode, mode: input.mode });
  const phoneDigits = input.phone?.replace(/[^\d+]/g, "") ?? "";
  const phoneHref = phoneDigits.length >= 8 ? `tel:${phoneDigits.startsWith("+") ? phoneDigits : phoneDigits}` : null;
  return {
    phone: input.phone,
    phoneHref,
    kakao: input.kakaoUrl,
    whatsapp: input.whatsappE164 ? whatsappHref(input.whatsappE164, message) : null,
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
  set("transferType", query.transferType);
  set("status", query.status);
  if (sort !== "newest") set("sort", sort);
  params.set("mode", ctx.mode);
  if (ctx.ref) params.set("ref", ctx.ref);
  return `${base}?${params.toString()}`;
}
