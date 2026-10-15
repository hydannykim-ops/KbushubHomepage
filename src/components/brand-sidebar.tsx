import Link from "next/link";
import { MakerMark } from "@/components/maker-mark";
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
    <aside className="border-b border-[#d8dde6]/80 lg:border-b-0 lg:border-r lg:border-[#d8dde6]/80" data-brand-sidebar>
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
              "flex items-center justify-between gap-3 rounded-md px-2 py-2.5 text-sm transition-colors",
              !selectedMaker ? "bg-[#e4e8ef]/80 font-semibold text-ink" : "text-ink hover:bg-[#e4e8ef]/50",
            ].join(" ")}
            aria-current={!selectedMaker ? "page" : undefined}
          >
            <span className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#d5dae3] text-[11px] font-bold text-ink" aria-hidden>
                All
              </span>
              {text.all}
            </span>
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
                    "flex items-center justify-between gap-3 rounded-md px-2 py-2.5 text-sm transition-colors",
                    active ? "bg-[#e4e8ef]/80 font-semibold text-ink" : "text-ink hover:bg-[#e4e8ef]/50",
                  ].join(" ")}
                  aria-current={active && !selectedModel ? "page" : undefined}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <MakerMark maker={maker} active={active} />
                    <span className="truncate">{makerLabel(maker, lang)}</span>
                  </span>
                  <span className="tabular-nums text-[#2f6fed]">{count}</span>
                </Link>
                {active ? (
                  <div className="mb-1 ml-4 border-l border-[#d0d5de] pl-3" role="group" aria-label={`${makerLabel(maker, lang)} ${text.model}`}>
                    <Link
                      href={hrefFor(lang, ctx, query, { maker, model: undefined })}
                      className={["block py-2 text-sm", !selectedModel ? "font-semibold text-ink" : "text-muted hover:text-ink"].join(" ")}
                    >
                      {text.all}
                    </Link>
                    {models.map((model) => (
                      <Link
                        key={model}
                        href={hrefFor(lang, ctx, query, { maker, model })}
                        className={[
                          "block py-2 text-sm",
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
