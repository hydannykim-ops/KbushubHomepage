"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MakerMark } from "@/components/maker-mark";
import {
  makerLabel,
  makersForClass,
  modelsForSeries,
  seriesForMaker,
  seriesForModel,
  seriesHasVariants,
} from "@/lib/domain/vehicle-catalog";
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

function lockedClass() {
  return "flex w-full items-center justify-between gap-3 rounded-md bg-[#e4e8ef]/80 px-2 py-2.5 text-left text-sm font-semibold text-ink";
}

function optionClass(active: boolean) {
  return [
    "flex w-full items-center justify-between gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors",
    active ? "bg-[#e4e8ef]/80 font-semibold text-ink" : "text-ink hover:bg-[#e4e8ef]/50",
  ].join(" ");
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

  /** Intermediate series pick before a concrete model URL is chosen. */
  const [draftSeries, setDraftSeries] = useState("");

  useEffect(() => {
    setDraftSeries("");
  }, [selectedMaker, selectedModel, vehicleClass]);

  const seriesList = selectedMaker ? seriesForMaker(selectedMaker, vehicleClass) : [];
  const lockedSeries = selectedModel ? seriesForModel(selectedModel) : draftSeries;
  const done = Boolean(selectedMaker && selectedModel);
  const pickingSeries = Boolean(selectedMaker && !selectedModel && !draftSeries);
  const pickingVariant =
    Boolean(selectedMaker && draftSeries && !selectedModel) && seriesHasVariants(selectedMaker, draftSeries, vehicleClass);
  const variants =
    selectedMaker && lockedSeries ? modelsForSeries(selectedMaker, lockedSeries, vehicleClass) : [];

  return (
    <aside className="border-b border-[#d8dde6]/80 lg:border-b-0 lg:border-r lg:border-[#d8dde6]/80" data-brand-sidebar>
      <div className="max-h-64 overflow-y-auto px-3 py-4 lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] md:px-4">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <h2 className="text-sm font-semibold text-ink">{text.brandModel}</h2>
          {(selectedMaker || selectedModel || draftSeries) && (
            <Link
              href={hrefFor(lang, ctx, query, { maker: undefined, model: undefined })}
              className="text-xs font-medium text-muted hover:text-ink"
              onClick={() => setDraftSeries("")}
            >
              {text.reset}
            </Link>
          )}
        </div>

        <nav className="grid gap-1" aria-label={text.brandModel}>
          {!selectedMaker ? (
            <>
              <Link
                href={hrefFor(lang, ctx, query, { maker: undefined, model: undefined })}
                className={optionClass(true)}
                aria-current="page"
              >
                <span className="flex items-center gap-2.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#d5dae3] text-[11px] font-bold text-ink" aria-hidden>
                    All
                  </span>
                  {text.all}
                </span>
                <span className="tabular-nums text-[#2f6fed]">{total}</span>
              </Link>
              {makers.map((maker) => (
                <Link key={maker} href={hrefFor(lang, ctx, query, { maker, model: undefined })} className={optionClass(false)}>
                  <span className="flex min-w-0 items-center gap-2.5">
                    <MakerMark maker={maker} active={false} />
                    <span className="truncate">{makerLabel(maker, lang)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums text-[#2f6fed]">{counts[maker] ?? 0}</span>
                    <span aria-hidden className="text-[10px] text-muted">
                      ›
                    </span>
                  </span>
                </Link>
              ))}
            </>
          ) : null}

          {selectedMaker ? (
            <Link
              href={hrefFor(lang, ctx, query, { maker: undefined, model: undefined })}
              className={lockedClass()}
              onClick={() => setDraftSeries("")}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <MakerMark maker={selectedMaker} active />
                <span className="min-w-0">
                  <span className="block text-[11px] font-medium text-muted">{text.maker}</span>
                  <span className="block truncate">{makerLabel(selectedMaker, lang)}</span>
                </span>
              </span>
              <span className="shrink-0 text-xs font-medium text-muted">{text.reset}</span>
            </Link>
          ) : null}

          {(done || pickingVariant) && lockedSeries ? (
            done ? (
              <Link href={hrefFor(lang, ctx, query, { maker: selectedMaker, model: undefined })} className={lockedClass()} onClick={() => setDraftSeries("")}>
                <span className="min-w-0">
                  <span className="block text-[11px] font-medium text-muted">{text.model}</span>
                  <span className="block truncate">{selectedModel}</span>
                </span>
                <span className="shrink-0 text-xs font-medium text-muted">{text.reset}</span>
              </Link>
            ) : (
              <button type="button" className={lockedClass()} onClick={() => setDraftSeries("")}>
                <span className="min-w-0">
                  <span className="block text-[11px] font-medium text-muted">{text.model}</span>
                  <span className="block truncate">{lockedSeries}</span>
                </span>
                <span className="shrink-0 text-xs font-medium text-muted">{text.reset}</span>
              </button>
            )
          ) : null}

          {pickingSeries ? (
            <div className="grid gap-0.5" role="group" aria-label={`${makerLabel(selectedMaker, lang)} ${text.model}`}>
              <Link
                href={hrefFor(lang, ctx, query, { maker: selectedMaker, model: undefined })}
                className={optionClass(true)}
                aria-current="page"
              >
                <span>{text.all}</span>
              </Link>
              {seriesList.map((series) => {
                const multi = seriesHasVariants(selectedMaker, series, vehicleClass);
                const lone = modelsForSeries(selectedMaker, series, vehicleClass)[0] ?? series;
                if (multi) {
                  return (
                    <button key={series} type="button" className={optionClass(false)} onClick={() => setDraftSeries(series)}>
                      <span>{series}</span>
                      <span aria-hidden className="text-[10px] text-muted">
                        ›
                      </span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={series}
                    href={hrefFor(lang, ctx, query, { maker: selectedMaker, model: lone })}
                    className={optionClass(false)}
                  >
                    <span>{series}</span>
                  </Link>
                );
              })}
            </div>
          ) : null}

          {pickingVariant ? (
            <div className="grid gap-0.5" role="group" aria-label={`${lockedSeries} ${text.model}`}>
              {variants.map((model) => (
                <Link key={model} href={hrefFor(lang, ctx, query, { maker: selectedMaker, model })} className={optionClass(false)}>
                  <span>{model}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </nav>
      </div>
    </aside>
  );
}
