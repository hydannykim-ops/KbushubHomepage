import { activePrice, formatMoney, isExportOffer, textOf } from "@/lib/domain";
import { getDict } from "@/lib/i18n";
import type { Locale, PublicVehicle, TradeMode } from "@/lib/types";

export function PriceBlock({
  vehicle,
  trade,
  lang,
  large = false,
}: {
  vehicle: PublicVehicle;
  trade: TradeMode;
  lang: Locale;
  large?: boolean;
}) {
  const dict = getDict(lang);
  const price = activePrice(vehicle, trade);
  const basis =
    trade === "domestic"
      ? dict.inventory.basisDomestic
      : price && isExportOffer(price)
        ? `${dict.inventory.basisExport} · ${price.terms}`
        : dict.inventory.basisExport;
  return (
    <div>
      <p className="text-xs text-muted">{basis}</p>
      <p className={`mt-1 font-semibold tabular-nums tracking-[-0.03em] ${large ? "text-3xl" : "text-2xl"}`}>
        {price ? formatMoney(price.amount, price.currency, lang) : dict.common.priceAsk}
      </p>
      {price && isExportOffer(price) ? (
        <p className="mt-1 text-xs leading-5 text-muted">{textOf(price.includes, lang, "")}</p>
      ) : null}
      {vehicle.sample ? <p className="mt-1 text-xs text-muted">{dict.detail.samplePrice}</p> : null}
    </div>
  );
}
