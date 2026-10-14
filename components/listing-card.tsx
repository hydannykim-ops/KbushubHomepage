import Image from "next/image";
import Link from "next/link";
import { PhotoFrame } from "@/components/photo-frame";
import { PriceBlock } from "@/components/price-block";
import { StatusBadge } from "@/components/status-badge";
import { textOf, vehicleTitle } from "@/lib/domain";
import { getDict } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { panel } from "@/lib/ui";
import type { Locale, PublicVehicle, TradeMode } from "@/lib/types";

export function ListingCard({
  vehicle,
  lang,
  trade,
  layout = "row",
}: {
  vehicle: PublicVehicle;
  lang: Locale;
  trade: TradeMode;
  layout?: "row" | "grid" | "feature";
}) {
  const dict = getDict(lang);
  const title = vehicleTitle(vehicle, lang);
  const cover = vehicle.photos.find((photo) => photo.file);
  const photoLabel = vehicle.photos.length ? dict.common.photoPending : dict.common.photoNone;
  const href = hrefFor(lang, `/inventory/${vehicle.id}`, trade);
  const facts = [
    [dict.detail.year, String(vehicle.year)],
    [dict.detail.seats, vehicle.seats == null ? dict.common.unknown : String(vehicle.seats)],
    [
      dict.detail.mileage,
      vehicle.mileageKm == null ? dict.common.unknown : `${vehicle.mileageKm.toLocaleString(lang === "ko" ? "ko-KR" : "en-US")}km`,
    ],
    [dict.detail.transmission, dict.transmission[vehicle.transmission]],
  ];
  const media = (
    <div className={`relative bg-sand ${layout === "row" ? "min-h-56 md:h-full" : layout === "feature" ? "aspect-[4/3]" : "aspect-[3/2]"}`}>
      {cover ? (
        <Image
          src={`/stock/${cover.file}`}
          alt={textOf(cover.alt, lang, title)}
          width={1200}
          height={800}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <PhotoFrame kicker={dict.common.slotPhoto} caption={photoLabel} fill />
      )}
    </div>
  );

  return (
    <article className={`${panel} overflow-hidden ${vehicle.status === "sold" ? "opacity-75" : ""}`}>
      <Link
        href={href}
        className={
          layout === "grid"
            ? "block"
            : layout === "feature"
              ? "grid lg:grid-cols-2"
              : "grid md:grid-cols-[minmax(220px,340px)_minmax(0,1fr)]"
        }
      >
        {media}
        <div className={`flex flex-col ${layout === "feature" ? "justify-center p-6 md:p-8" : "p-5"}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] tracking-wide text-muted">
                {vehicle.id} · {dict.common.sample}
              </p>
              <h2 className={`mt-2 font-semibold tracking-[-0.03em] ${layout === "feature" ? "text-2xl md:text-3xl" : "text-lg"}`}>
                {title}
              </h2>
            </div>
            <div className="flex gap-2">
              {vehicle.featured ? (
                <span className="inline-flex items-center rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white">
                  {dict.common.featured}
                </span>
              ) : null}
              <StatusBadge status={vehicle.status} lang={lang} />
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[12px] text-muted">{label}</dt>
                <dd className="mt-0.5">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex items-end justify-between gap-4 border-t border-line/80 pt-4">
            <PriceBlock vehicle={vehicle} trade={trade} lang={lang} />
            <span className="text-sm font-semibold text-blue">{dict.common.details}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
