import Link from "next/link";
import { makerLabel, makersForClass, modelsForMaker } from "@/lib/domain/vehicle-catalog";
import type { Lang, TradeMode, VehicleClass, VehicleQuery } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { serializeVehicleQuery } from "@/lib/domain/filters";

function hrefFor(
  lang: Lang,
  ctx: { mode: TradeMode; ref: string | null },
  query: VehicleQuery,
  patch: Partial<VehicleQuery>,
) {
  const next: VehicleQuery = { ...query, ...patch };
  const qs = serializeVehicleQuery(next, { mode: ctx.mode, ref: ctx.ref });
  return `/${lang}/vehicles?${qs}`;
}

export function BrandSidebar({
  lang,
  ctx,
  query,
  counts,
}: {
  lang: Lang;
  ctx: { mode: TradeMode; ref: string | null };
  query: VehicleQuery;
  counts: Record<string, number>;
}) {
  const text = copy(lang);
  const vehicleClass = (query.vehicleClass || "") as VehicleClass | "";
  const makers = makersForClass(vehicleClass);
  const selectedMaker = query.maker ?? "";
  const selectedModel = query.model ?? "";
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <aside className="border-b border-line bg-white lg:border-b-0 lg:border-r" data-brand-sidebar>
      <div className="max-h-64 overflow-y-auto px-3 py-4 lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] md:px-4">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <h2 className="text-sm font-semibold text-ink">{text.brandModel}</h2>
          {(selectedMaker || selectedModel) && (
            <Link href={hrefFor(lang, ctx, query, { maker: undefined, model: undefined })} className="text-xs font-medium text-muted hover:text-ink">
              {text.reset}
            </Link>
          )}
        </div>

        <nav className="grid gap-0.5" aria-label={text.maker}>
          <Link
            href={hrefFor(lang, ctx, query, { maker: undefined, model: undefined })}
            className={[
              "flex items-center justify-between gap-3 px-2.5 py-2.5 text-sm transition-colors",
              !selectedMaker ? "bg-[#eef1f5] font-semibold text-ink" : "text-ink hover:bg-[#f6f7f9]",
            ].join(" ")}
            aria-current={!selectedMaker ? "page" : undefined}
          >
            <span>{text.all}</span>
            <span className="tabular-nums text-[#2f6fed]">{total}</span>
          </Link>

          {makers.map((maker) => {
            const active = selectedMaker === maker;
            const count = counts[maker] ?? 0;
            const models = modelsForMaker(maker, vehicleClass);
            return (
              <div key={maker}>
                <Link
                  href={hrefFor(lang, ctx, query, { maker, model: undefined })}
                  className={[
                    "flex items-center justify-between gap-3 px-2.5 py-2.5 text-sm transition-colors",
                    active ? "bg-[#eef1f5] font-semibold text-ink" : "text-ink hover:bg-[#f6f7f9]",
                  ].join(" ")}
                  aria-current={active && !selectedModel ? "page" : undefined}
                >
                  <span>{makerLabel(maker, lang)}</span>
                  <span className="tabular-nums text-[#2f6fed]">{count}</span>
                </Link>
                {active ? (
                  <div className="mb-1 ml-2 border-l border-line pl-2" role="group" aria-label={`${makerLabel(maker, lang)} ${text.model}`}>
                    <Link
                      href={hrefFor(lang, ctx, query, { maker, model: undefined })}
                      className={[
                        "block px-2 py-2 text-sm",
                        !selectedModel ? "font-semibold text-ink" : "text-muted hover:text-ink",
                      ].join(" ")}
                    >
                      {text.all}
                    </Link>
                    {models.map((model) => (
                      <Link
                        key={model}
                        href={hrefFor(lang, ctx, query, { maker, model })}
                        className={[
                          "block px-2 py-2 text-sm",
                          selectedModel === model ? "font-semibold text-ink" : "text-muted hover:text-ink",
                        ].join(" ")}
                        aria-current={selectedModel === model ? "page" : undefined}
                      >
                        {model}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
