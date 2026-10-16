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

  const classLabelMap: Record<VehicleClass | "", string> = {
    "": text.all,
    county: text.classCounty,
    medium: text.classMedium,
    large: text.classLarge,
  };

  /** Class is step 1; empty URL class still counts once the user picks “전체”. */
  const [classPicked, setClassPicked] = useState(() => Boolean(query.vehicleClass || query.maker || query.model));
  /** Intermediate series pick before a concrete model URL is chosen. */
  const [draftSeries, setDraftSeries] = useState("");

  useEffect(() => {
    if (query.vehicleClass || query.maker || query.model) setClassPicked(true);
  }, [query.vehicleClass, query.maker, query.model]);

  useEffect(() => {
    setDraftSeries("");
  }, [selectedMaker, selectedModel, vehicleClass]);

  const seriesList = selectedMaker ? seriesForMaker(selectedMaker, vehicleClass) : [];
  const lockedSeries = selectedModel ? seriesForModel(selectedModel) : draftSeries;
  const done = Boolean(classPicked && selectedMaker && selectedModel);
  const pickingClass = !classPicked;
  const pickingMaker = Boolean(classPicked && !selectedMaker);
  const pickingSeries = Boolean(classPicked && selectedMaker && !selectedModel && !draftSeries);
  /** Always require an explicit model tap, even when the series has only one model. */
  const pickingVariant = Boolean(classPicked && selectedMaker && draftSeries && !selectedModel);
  const variants =
    selectedMaker && lockedSeries ? modelsForSeries(selectedMaker, lockedSeries, vehicleClass) : [];

  const clearAllHref = hrefFor(lang, ctx, query, { vehicleClass: undefined, maker: undefined, model: undefined });
  const clearMakerHref = hrefFor(lang, ctx, query, { maker: undefined, model: undefined });
  const clearSeriesHref = hrefFor(lang, ctx, query, { maker: selectedMaker, model: undefined });

  return (
    <aside className="border-b border-[#d8dde6]/80 lg:border-b-0 lg:border-r lg:border-[#d8dde6]/80" data-brand-sidebar>
      <div className="max-h-64 overflow-y-auto px-3 py-4 lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] md:px-4">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <h2 className="text-sm font-semibold text-ink">{text.brandModel}</h2>
          {(classPicked || selectedMaker || selectedModel || draftSeries) && (
            <Link
              href={clearAllHref}
              className="text-xs font-medium text-muted hover:text-ink"
              onClick={() => {
                setClassPicked(false);
                setDraftSeries("");
              }}
            >
              {text.reset}
            </Link>
          )}
        </div>

        <nav className="grid gap-1" aria-label={text.brandModel}>
          {classPicked ? (
            <Link
              href={clearAllHref}
              className={lockedClass()}
              onClick={() => {
                setClassPicked(false);
                setDraftSeries("");
              }}
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-medium text-muted">{text.classLabel}</span>
                <span className="block truncate">{classLabelMap[vehicleClass]}</span>
              </span>
              <span className="shrink-0 text-xs font-medium text-muted">{text.reset}</span>
            </Link>
          ) : null}

          {selectedMaker ? (
            <Link
              href={clearMakerHref}
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

          {lockedSeries && (done || pickingVariant) ? (
            done ? (
              <Link href={clearSeriesHref} className={lockedClass()} onClick={() => setDraftSeries("")}>
                <span className="min-w-0">
                  <span className="block text-[11px] font-medium text-muted">{text.series}</span>
                  <span className="block truncate">{lockedSeries}</span>
                </span>
                <span className="shrink-0 text-xs font-medium text-muted">{text.reset}</span>
              </Link>
            ) : (
              <button type="button" className={lockedClass()} onClick={() => setDraftSeries("")}>
                <span className="min-w-0">
                  <span className="block text-[11px] font-medium text-muted">{text.series}</span>
                  <span className="block truncate">{lockedSeries}</span>
                </span>
                <span className="shrink-0 text-xs font-medium text-muted">{text.reset}</span>
              </button>
            )
          ) : null}

          {done && selectedModel ? (
            <Link href={clearSeriesHref} className={lockedClass()} onClick={() => setDraftSeries("")}>
              <span className="min-w-0">
                <span className="block text-[11px] font-medium text-muted">{text.model}</span>
                <span className="block truncate">{selectedModel}</span>
              </span>
              <span className="shrink-0 text-xs font-medium text-muted">{text.reset}</span>
            </Link>
          ) : null}

          {pickingClass ? (
            <div className="grid gap-0.5" role="group" aria-label={text.classLabel}>
              {(["", "county", "medium", "large"] as const).map((value) => {
                const href = hrefFor(lang, ctx, query, {
                  vehicleClass: value || undefined,
                  maker: undefined,
                  model: undefined,
                });
                return (
                  <Link
                    key={value || "all"}
                    href={href}
                    className={optionClass(false)}
                    onClick={() => {
                      setClassPicked(true);
                      setDraftSeries("");
                    }}
                  >
                    <span>{classLabelMap[value]}</span>
                    <span aria-hidden className="text-[10px] text-muted">
                      ›
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : null}

          {pickingMaker ? (
            <>
              <Link
                href={clearMakerHref}
                className={optionClass(true)}
                aria-current="page"
                onClick={() => setDraftSeries("")}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#d5dae3] text-[11px] font-bold text-ink"
                    aria-hidden
                  >
                    All
                  </span>
                  {text.all}
                </span>
                <span className="tabular-nums text-[#2f6fed]">{total}</span>
              </Link>
              {makers.map((maker) => (
                <Link
                  key={maker}
                  href={hrefFor(lang, ctx, query, { maker, model: undefined })}
                  className={optionClass(false)}
                >
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

          {pickingSeries ? (
            <div className="grid gap-0.5" role="group" aria-label={`${makerLabel(selectedMaker, lang)} ${text.series}`}>
              <Link
                href={clearSeriesHref}
                className={optionClass(true)}
                aria-current="page"
              >
                <span>{text.all}</span>
              </Link>
              {seriesList.map((series) => (
                <button
                  key={series}
                  type="button"
                  data-series={series}
                  className={optionClass(false)}
                  onClick={(event) => {
                    event.preventDefault();
                    setDraftSeries(series);
                  }}
                >
                  <span>{series}</span>
                  <span aria-hidden className="text-[10px] text-muted">
                    ›
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {pickingVariant ? (
            <div className="grid gap-0.5" role="group" aria-label={`${lockedSeries} ${text.model}`}>
              {variants.map((model) => (
                <Link
                  key={model}
                  href={hrefFor(lang, ctx, query, { maker: selectedMaker, model })}
                  className={optionClass(false)}
                >
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
