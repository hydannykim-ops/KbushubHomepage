"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lang, TradeMode, VehicleClass, VehicleQuery } from "@/lib/domain/types";
import { localeTag } from "@/lib/i18n/langs";
import { copy } from "@/lib/i18n";
import { fuelLabel, statusLabel, transmissionLabel } from "@/lib/labels";

type Ctx = { mode: TradeMode; ref: string | null };

function queryToParams(query: VehicleQuery, ctx: Ctx): URLSearchParams {
  const params = new URLSearchParams();
  params.set("mode", ctx.mode);
  if (ctx.ref) params.set("ref", ctx.ref);
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
  if (query.sort && query.sort !== "newest") set("sort", query.sort);
  return params;
}

function chipClass(active: boolean, open: boolean) {
  return [
    "inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3.5 text-sm transition-colors",
    active || open
      ? "bg-ink text-white"
      : "bg-transparent text-ink ring-1 ring-[#cfd5df] hover:bg-[#e8ebf0]",
  ].join(" ");
}

export function MarketFilterBar({
  lang,
  ctx,
  query,
}: {
  lang: Lang;
  ctx: Ctx;
  query: VehicleQuery;
}) {
  const text = copy(lang);
  const router = useRouter();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [draft, setDraft] = useState(query);
  const baseId = useId();

  useEffect(() => {
    setDraft(query);
    setOpenKey(null);
  }, [query]);

  function navigate(next: VehicleQuery) {
    const params = queryToParams(next, ctx);
    router.push(`/${lang}/vehicles?${params.toString()}`);
    setOpenKey(null);
  }

  function openPanel(key: string) {
    setDraft(query);
    setOpenKey((current) => (current === key ? null : key));
  }

  const yearActive = query.yearMin != null || query.yearMax != null;
  const mileageActive = query.mileageMax != null;
  const priceActive = query.priceMin != null || query.priceMax != null || Boolean(query.priceCurrency);
  const fuelActive = Boolean(query.fuel);
  const seatsActive = query.seatsMin != null;
  const transmissionActive = Boolean(query.transmission);
  const statusActive = Boolean(query.status);
  const classActive = Boolean(query.vehicleClass);

  const yearLabel = yearActive
    ? `${query.yearMin ?? ""}${query.yearMin != null || query.yearMax != null ? "~" : ""}${query.yearMax ?? ""}`.replace(/^~$/, text.year)
    : text.year;
  const mileageLabel = mileageActive
    ? `~${Number(query.mileageMax).toLocaleString(localeTag(lang))} km`
    : text.mileage;
  const priceLabel = priceActive
    ? `${query.priceMin != null ? Number(query.priceMin).toLocaleString(localeTag(lang)) : ""}${
        query.priceMin != null || query.priceMax != null ? "~" : ""
      }${query.priceMax != null ? Number(query.priceMax).toLocaleString(localeTag(lang)) : ""}`.replace(/^~$/, text.price)
    : text.price;

  const classLabelMap: Record<VehicleClass | "", string> = {
    "": text.all,
    county: text.classCounty,
    medium: text.classMedium,
    large: text.classLarge,
  };

  const input = "w-full border-0 border-b border-[#cfd5df] bg-transparent px-0 py-2 text-sm outline-none focus:border-ink";
  const applyBtn = "bg-ink px-4 py-2.5 text-sm font-semibold text-white";
  const clearBtn = "px-3 py-2.5 text-sm font-medium text-muted hover:text-ink";
  const optionBtn = (active: boolean) =>
    ["w-full px-2 py-2.5 text-left text-sm transition-colors", active ? "font-semibold text-ink" : "text-muted hover:text-ink"].join(" ");

  const chips: Array<{ key: string; label: string; active: boolean }> = [
    { key: "class", label: classActive ? classLabelMap[query.vehicleClass ?? ""] : text.classLabel, active: classActive },
    { key: "year", label: yearActive ? yearLabel : text.year, active: yearActive },
    { key: "mileage", label: mileageActive ? mileageLabel : text.mileage, active: mileageActive },
    { key: "price", label: priceActive ? priceLabel : text.price, active: priceActive },
    { key: "fuel", label: fuelActive ? fuelLabel(query.fuel as "diesel", lang) : text.fuel, active: fuelActive },
    { key: "seats", label: seatsActive ? `${query.seatsMin}+` : text.seats, active: seatsActive },
    { key: "transmission", label: transmissionActive ? transmissionLabel(query.transmission as "automatic", lang) : text.transmission, active: transmissionActive },
    { key: "status", label: statusActive ? statusLabel(query.status as "available", lang) : text.status, active: statusActive },
  ];

  return (
    <div className="grid gap-3" data-market-filter-bar>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            id={`${baseId}-${chip.key}`}
            className={chipClass(chip.active, openKey === chip.key)}
            aria-expanded={openKey === chip.key}
            onClick={() => openPanel(chip.key)}
          >
            {chip.label}
            <span aria-hidden className="text-[10px] opacity-70">
              {openKey === chip.key ? "▴" : "▾"}
            </span>
          </button>
        ))}
      </div>

      {openKey ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${baseId}-${openKey}`}
          className="px-0.5 pb-1 pt-1"
        >
          {openKey === "class" ? (
            <div className="grid max-w-sm gap-1">
              {(["", "county", "medium", "large"] as const).map((value) => (
                <button
                  key={value || "all"}
                  type="button"
                  className={optionBtn(draft.vehicleClass === value || (!draft.vehicleClass && value === ""))}
                  onClick={() => navigate({ ...query, vehicleClass: value, maker: undefined, model: undefined })}
                >
                  {classLabelMap[value]}
                </button>
              ))}
            </div>
          ) : null}

          {openKey === "year" ? (
            <div className="max-w-md">
              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-1 text-xs font-semibold text-muted">
                  {text.from}
                  <input
                    inputMode="numeric"
                    className={input}
                    value={draft.yearMin ?? ""}
                    onChange={(event) => setDraft((current) => ({ ...current, yearMin: event.target.value ? Number(event.target.value) : null }))}
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-muted">
                  {text.to}
                  <input
                    inputMode="numeric"
                    className={input}
                    value={draft.yearMax ?? ""}
                    onChange={(event) => setDraft((current) => ({ ...current, yearMax: event.target.value ? Number(event.target.value) : null }))}
                  />
                </label>
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" className={applyBtn} onClick={() => navigate(draft)}>
                  {text.applyFilters}
                </button>
                <button type="button" className={clearBtn} onClick={() => navigate({ ...query, yearMin: null, yearMax: null })}>
                  {text.reset}
                </button>
              </div>
            </div>
          ) : null}

          {openKey === "mileage" ? (
            <div className="max-w-xs">
              <label className="grid gap-1 text-xs font-semibold text-muted">
                {text.to}
                <input
                  inputMode="numeric"
                  className={input}
                  value={draft.mileageMax ?? ""}
                  onChange={(event) => setDraft((current) => ({ ...current, mileageMax: event.target.value ? Number(event.target.value) : null }))}
                />
              </label>
              <div className="mt-4 flex gap-2">
                <button type="button" className={applyBtn} onClick={() => navigate(draft)}>
                  {text.applyFilters}
                </button>
                <button type="button" className={clearBtn} onClick={() => navigate({ ...query, mileageMax: null })}>
                  {text.reset}
                </button>
              </div>
            </div>
          ) : null}

          {openKey === "price" ? (
            <div className="max-w-md">
              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-1 text-xs font-semibold text-muted">
                  {text.from}
                  <input
                    inputMode="numeric"
                    className={input}
                    value={draft.priceMin ?? ""}
                    onChange={(event) => setDraft((current) => ({ ...current, priceMin: event.target.value ? Number(event.target.value) : null }))}
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-muted">
                  {text.to}
                  <input
                    inputMode="numeric"
                    className={input}
                    value={draft.priceMax ?? ""}
                    onChange={(event) => setDraft((current) => ({ ...current, priceMax: event.target.value ? Number(event.target.value) : null }))}
                  />
                </label>
              </div>
              {ctx.mode === "export" ? (
                <label className="mt-3 grid gap-1 text-xs font-semibold text-muted">
                  {text.currency}
                  <select
                    className={input}
                    value={draft.priceCurrency ?? ""}
                    onChange={(event) => setDraft((current) => ({ ...current, priceCurrency: event.target.value || null }))}
                  >
                    <option value="">{text.all}</option>
                    {["USD", "EUR", "KRW", "JPY", "CNY", "AED"].map((currency) => (
                      <option key={currency}>{currency}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              <div className="mt-4 flex gap-2">
                <button type="button" className={applyBtn} onClick={() => navigate(draft)}>
                  {text.applyFilters}
                </button>
                <button type="button" className={clearBtn} onClick={() => navigate({ ...query, priceMin: null, priceMax: null, priceCurrency: null })}>
                  {text.reset}
                </button>
              </div>
            </div>
          ) : null}

          {openKey === "fuel" ? (
            <div className="grid max-w-sm gap-1">
              {(["", "diesel", "gasoline", "lpg", "cng", "electric", "hybrid"] as const).map((value) => (
                <button
                  key={value || "all"}
                  type="button"
                  className={optionBtn((draft.fuel || "") === value)}
                  onClick={() => navigate({ ...query, fuel: value })}
                >
                  {value ? fuelLabel(value, lang) : text.all}
                </button>
              ))}
            </div>
          ) : null}

          {openKey === "seats" ? (
            <div className="max-w-xs">
              <label className="grid gap-1 text-xs font-semibold text-muted">
                {text.from}
                <input
                  inputMode="numeric"
                  className={input}
                  value={draft.seatsMin ?? ""}
                  onChange={(event) => setDraft((current) => ({ ...current, seatsMin: event.target.value ? Number(event.target.value) : null }))}
                />
              </label>
              <div className="mt-4 flex gap-2">
                <button type="button" className={applyBtn} onClick={() => navigate(draft)}>
                  {text.applyFilters}
                </button>
                <button type="button" className={clearBtn} onClick={() => navigate({ ...query, seatsMin: null })}>
                  {text.reset}
                </button>
              </div>
            </div>
          ) : null}

          {openKey === "transmission" ? (
            <div className="grid max-w-sm gap-1">
              {(["", "automatic", "manual"] as const).map((value) => (
                <button
                  key={value || "all"}
                  type="button"
                  className={optionBtn((draft.transmission || "") === value)}
                  onClick={() => navigate({ ...query, transmission: value })}
                >
                  {value ? transmissionLabel(value, lang) : text.all}
                </button>
              ))}
            </div>
          ) : null}

          {openKey === "status" ? (
            <div className="grid max-w-sm gap-1">
              {(["", "available", "reserved", "sold"] as const).map((value) => (
                <button
                  key={value || "all"}
                  type="button"
                  className={optionBtn((draft.status || "") === value)}
                  onClick={() => navigate({ ...query, status: value })}
                >
                  {value ? statusLabel(value, lang) : text.all}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
