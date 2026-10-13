import Image from "next/image";
import Link from "next/link";
import { BusArt } from "@/components/bus-art";
import { PriceBlock } from "@/components/price-block";
import { StatusBadge } from "@/components/status-badge";
import { textOf, vehicleTitle } from "@/lib/domain";
import { getDict } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
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
  layout?: "row" | "grid";
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
  const media = cover ? (
    <Image
      src={`/stock/${cover.file}`}
      alt={textOf(cover.alt, lang, title)}
      width={960}
      height={600}
      className="h-full w-full object-cover"
    />
  ) : (
    <BusArt variant={vehicle.class} label={photoLabel} fill />
  );

  return (
    <article className={`border border-line bg-white ${vehicle.status === "sold" ? "opacity-80" : ""}`}>
      <Link href={href} className={layout === "grid" ? "block" : "grid md:grid-cols-[280px_minmax(0,1fr)]"}>
        <div className="relative min-h-52 border-b border-line md:border-b-0 md:border-r">{media}</div>
        <div className="flex flex-col p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-muted">
                {vehicle.id} · {dict.common.sample}
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">{title}</h2>
            </div>
            <div className="flex gap-2">
              {vehicle.featured ? (
                <span className="bg-ink px-2 py-1 text-xs font-semibold text-white">{dict.common.featured}</span>
              ) : null}
              <StatusBadge status={vehicle.status} lang={lang} />
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-4">
            <PriceBlock vehicle={vehicle} trade={trade} lang={lang} />
            <span className="text-sm font-semibold text-blue">{dict.common.details}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
