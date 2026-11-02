"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { MakerMark } from "@/components/maker-mark";
import {
  makerLabel,
  makersForClass,
  modelLabel,
  modelsForSeries,
  seriesForMaker,
  seriesForModel,
  seriesLabel,
} from "@/lib/domain/vehicle-catalog";
import type { Lang, VehicleClass, VehicleQuery } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { serializeVehicleQuery } from "@/lib/domain/filters";

function hrefFor(
  lang: Lang,
  ctx: { ref: string | null },
  query: VehicleQuery,
  patch: Partial<VehicleQuery>,
) {
  const next: VehicleQuery = { ...query, ...patch };
  const qs = serializeVehicleQuery(next, { ref: ctx.ref });
  return qs ? `/${lang}/vehicles?${qs}` : `/${lang}/vehicles`;
}

function LockedRow({
  href,
  label,
  value,
  action,
  leading,
  onClick,
}: {
  href?: string;
  label: string;
  value: string;
  action: string;
  leading?: ReactNode;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="flex min-w-0 items-center gap-2.5">
        {leading}
        <span className="min-w-0">
          <span className="picker-locked__meta">{label}</span>
          <span className="picker-locked__value">{value}</span>
        </span>
      </span>
      <span className="picker-locked__action">{action}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="picker-locked" onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className="picker-locked" onClick={onClick}>
      {inner}
    </button>
  );
}

function Stage({ label, stageKey, children }: { label: string; stageKey: string; children: ReactNode }) {
  return (
    <div className="picker-stage">
      <div key={stageKey} className="picker-stage__list" role="group" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

export function BrandSidebar({
  lang,
  ctx,
  query,
  counts,
}: {
  lang: Lang;
  ctx: { ref: string | null };
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

  /** Empty URL = 전체 목록. Only re-enter class pick when the user clears the locked class chip. */
  const [classPicked, setClassPicked] = useState(true);
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
    <aside
      className="border-b border-[#d8dde6]/80 bg-[#eef2f7]/70 lg:border-b-0 lg:border-r lg:border-[#d8dde6]/80"
      data-brand-sidebar
    >
      <div className="max-h-64 overflow-y-auto px-3 py-4 lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] md:px-4">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <h2 className="text-sm font-semibold text-ink">{text.brandModel}</h2>
          {(classPicked || selectedMaker || selectedModel || draftSeries) && (
            <Link
              href={clearAllHref}
              className="text-xs font-medium text-muted hover:text-ink"
              onClick={() => {
                setClassPicked(true);
                setDraftSeries("");
              }}
            >
              {text.reset}
            </Link>
          )}
        </div>

        <nav className="grid gap-2.5" aria-label={text.brandModel}>
          {classPicked ? (
            <LockedRow
              href={clearAllHref}
              label={text.classLabel}
              value={classLabelMap[vehicleClass]}
              action={text.changeSelection}
              onClick={() => {
                setClassPicked(false);
                setDraftSeries("");
              }}
            />
          ) : null}

          {selectedMaker ? (
            <LockedRow
              href={clearMakerHref}
              label={text.maker}
              value={makerLabel(selectedMaker, lang)}
              action={text.changeSelection}
              leading={<MakerMark maker={selectedMaker} active />}
              onClick={() => setDraftSeries("")}
            />
          ) : null}

          {lockedSeries && (done || pickingVariant) ? (
            done ? (
              <LockedRow
                href={clearSeriesHref}
                label={text.series}
                value={seriesLabel(lockedSeries, lang)}
                action={text.changeSelection}
                onClick={() => setDraftSeries("")}
              />
            ) : (
              <LockedRow
                label={text.series}
                value={seriesLabel(lockedSeries, lang)}
                action={text.changeSelection}
                onClick={() => setDraftSeries("")}
              />
            )
          ) : null}

          {done && selectedModel ? (
            <LockedRow
              href={clearSeriesHref}
              label={text.model}
              value={modelLabel(selectedModel, lang)}
              action={text.changeSelection}
              onClick={() => setDraftSeries("")}
            />
          ) : null}

          {pickingClass ? (
            <Stage label={text.classLabel} stageKey="class">
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
                    className="picker-option"
                    onClick={() => {
                      setClassPicked(true);
                      setDraftSeries("");
                    }}
                  >
                    <span>{classLabelMap[value]}</span>
                    <span aria-hidden className="picker-option__chevron">
                      ›
                    </span>
                  </Link>
                );
              })}
            </Stage>
          ) : null}

          {pickingMaker ? (
            <Stage label={text.maker} stageKey="maker">
              <Link
                href={clearMakerHref}
                className="picker-option"
                data-active="true"
                aria-current="page"
                onClick={() => setDraftSeries("")}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#e4e8ef] text-[11px] font-bold text-ink"
                    aria-hidden
                  >
                    All
                  </span>
                  {text.all}
                </span>
                <span className="picker-option__count">{total}</span>
              </Link>
              {makers.map((maker) => (
                <Link
                  key={maker}
                  href={hrefFor(lang, ctx, query, { maker, model: undefined })}
                  className="picker-option"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <MakerMark maker={maker} active={false} />
                    <span className="truncate">{makerLabel(maker, lang)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="picker-option__count">{counts[maker] ?? 0}</span>
                    <span aria-hidden className="picker-option__chevron">
                      ›
                    </span>
                  </span>
                </Link>
              ))}
            </Stage>
          ) : null}

          {pickingSeries ? (
            <Stage label={text.series} stageKey="series">
              <Link href={clearSeriesHref} className="picker-option" data-active="true" aria-current="page">
                <span>{text.all}</span>
              </Link>
              {seriesList.map((series) => (
                <button
                  key={series}
                  type="button"
                  data-series={series}
                  className="picker-option"
                  onClick={(event) => {
                    event.preventDefault();
                    setDraftSeries(series);
                  }}
                >
                  <span>{seriesLabel(series, lang)}</span>
                  <span aria-hidden className="picker-option__chevron">
                    ›
                  </span>
                </button>
              ))}
            </Stage>
          ) : null}

          {pickingVariant ? (
            <Stage label={text.model} stageKey="model">
              {variants.map((model) => (
                <Link
                  key={model}
                  href={hrefFor(lang, ctx, query, { maker: selectedMaker, model })}
                  className="picker-option"
                >
                  <span>{modelLabel(model, lang)}</span>
                  <span aria-hidden className="picker-option__chevron">
                    ›
                  </span>
                </Link>
              ))}
            </Stage>
          ) : null}
        </nav>
      </div>
    </aside>
  );
}
