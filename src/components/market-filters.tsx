"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lang, TradeMode, VehicleClass, VehicleQuery } from "@/lib/domain/types";
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
    "inline-flex h-9 shrink-0 items-center gap-1 rounded-full border px-3.5 text-sm transition-colors",
    active || open ? "border-ink bg-ink text-white" : "border-[#d8dde6] bg-white text-ink hover:border-ink/40",
  ].join(" ");
}

function FilterPanel({
  open,
  onClose,
  children,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) onClose();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={labelledBy}
      className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-line bg-white p-4 shadow-[0_12px_40px_rgba(16,32,51,0.12)]"
    >
      {children}
    </div>
  );
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
    ? `~${Number(query.mileageMax).toLocaleString(lang === "ko" ? "ko-KR" : "en-US")} km`
    : text.mileage;
  const priceLabel = priceActive
    ? `${query.priceMin != null ? Number(query.priceMin).toLocaleString(lang === "ko" ? "ko-KR" : "en-US") : ""}${
        query.priceMin != null || query.priceMax != null ? "~" : ""
      }${query.priceMax != null ? Number(query.priceMax).toLocaleString(lang === "ko" ? "ko-KR" : "en-US") : ""}`.replace(/^~$/, text.price)
    : text.price;

  const classLabelMap: Record<VehicleClass | "", string> = {
    "": text.all,
    county: text.classCounty,
    medium: text.classMedium,
    large: text.classLarge,
  };

  const input = "w-full border border-line bg-white px-3 py-2 text-sm";
  const applyBtn = "bg-ink px-4 py-2.5 text-sm font-semibold text-white";
  const clearBtn = "px-3 py-2.5 text-sm font-medium text-muted hover:text-ink";

  return (
    <div className="flex flex-wrap items-center gap-2" data-market-filter-bar>
      <div className="relative">
        <button type="button" id={`${baseId}-class`} className={chipClass(classActive, openKey === "class")} onClick={() => openPanel("class")}>
          {classActive ? classLabelMap[query.vehicleClass ?? ""] : text.classLabel}
          <span aria-hidden>▾</span>
        </button>
        <FilterPanel open={openKey === "class"} onClose={() => setOpenKey(null)} labelledBy={`${baseId}-class`}>
          <div className="grid gap-2">
            {(["", "county", "medium", "large"] as const).map((value) => (
              <button
                key={value || "all"}
                type="button"
                className={`px-3 py-2.5 text-left text-sm ${draft.vehicleClass === value || (!draft.vehicleClass && value === "") ? "bg-[#eef1f5] font-semibold" : "hover:bg-[#f6f7f9]"}`}
                onClick={() => setDraft((current) => ({ ...current, vehicleClass: value, maker: undefined, model: undefined }))}
              >
                {classLabelMap[value]}
              </button>
            ))}
            <div className="mt-2 flex gap-2 border-t border-line pt-3">
              <button type="button" className={applyBtn} onClick={() => navigate({ ...draft, maker: undefined, model: undefined })}>
                {text.applyFilters}
              </button>
              <button type="button" className={clearBtn} onClick={() => navigate({ ...query, vehicleClass: "", maker: query.maker, model: query.model })}>
                {text.reset}
              </button>
            </div>
          </div>
        </FilterPanel>
      </div>

      <div className="relative">
        <button type="button" id={`${baseId}-year`} className={chipClass(yearActive, openKey === "year")} onClick={() => openPanel("year")}>
          {yearActive ? yearLabel : text.year}
          <span aria-hidden>▾</span>
        </button>
        <FilterPanel open={openKey === "year"} onClose={() => setOpenKey(null)} labelledBy={`${baseId}-year`}>
          <div className="grid grid-cols-2 gap-3">
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
          <div className="mt-3 flex gap-2">
            <button type="button" className={applyBtn} onClick={() => navigate(draft)}>
              {text.applyFilters}
            </button>
            <button type="button" className={clearBtn} onClick={() => navigate({ ...query, yearMin: null, yearMax: null })}>
              {text.reset}
            </button>
          </div>
        </FilterPanel>
      </div>

      <div className="relative">
        <button type="button" id={`${baseId}-mileage`} className={chipClass(mileageActive, openKey === "mileage")} onClick={() => openPanel("mileage")}>
          {mileageActive ? mileageLabel : text.mileage}
          <span aria-hidden>▾</span>
        </button>
        <FilterPanel open={openKey === "mileage"} onClose={() => setOpenKey(null)} labelledBy={`${baseId}-mileage`}>
          <label className="grid gap-1 text-xs font-semibold text-muted">
            {text.to}
            <input
              inputMode="numeric"
              className={input}
              value={draft.mileageMax ?? ""}
              onChange={(event) => setDraft((current) => ({ ...current, mileageMax: event.target.value ? Number(event.target.value) : null }))}
            />
          </label>
          <div className="mt-3 flex gap-2">
            <button type="button" className={applyBtn} onClick={() => navigate(draft)}>
              {text.applyFilters}
            </button>
            <button type="button" className={clearBtn} onClick={() => navigate({ ...query, mileageMax: null })}>
              {text.reset}
            </button>
          </div>
        </FilterPanel>
      </div>

      <div className="relative">
        <button type="button" id={`${baseId}-price`} className={chipClass(priceActive, openKey === "price")} onClick={() => openPanel("price")}>
          {priceActive ? priceLabel : text.price}
          <span aria-hidden>▾</span>
        </button>
        <FilterPanel open={openKey === "price"} onClose={() => setOpenKey(null)} labelledBy={`${baseId}-price`}>
          <div className="grid grid-cols-2 gap-3">
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
          <div className="mt-3 flex gap-2">
            <button type="button" className={applyBtn} onClick={() => navigate(draft)}>
              {text.applyFilters}
            </button>
            <button type="button" className={clearBtn} onClick={() => navigate({ ...query, priceMin: null, priceMax: null, priceCurrency: null })}>
              {text.reset}
            </button>
          </div>
        </FilterPanel>
      </div>

      <div className="relative">
        <button type="button" id={`${baseId}-fuel`} className={chipClass(fuelActive, openKey === "fuel")} onClick={() => openPanel("fuel")}>
          {fuelActive ? fuelLabel(query.fuel as "diesel", lang) : text.fuel}
          <span aria-hidden>▾</span>
        </button>
        <FilterPanel open={openKey === "fuel"} onClose={() => setOpenKey(null)} labelledBy={`${baseId}-fuel`}>
          <div className="grid gap-1">
            {(["", "diesel", "gasoline", "lpg", "cng", "electric", "hybrid"] as const).map((value) => (
              <button
                key={value || "all"}
                type="button"
                className={`px-3 py-2.5 text-left text-sm ${(draft.fuel || "") === value ? "bg-[#eef1f5] font-semibold" : "hover:bg-[#f6f7f9]"}`}
                onClick={() => navigate({ ...query, fuel: value })}
              >
                {value ? fuelLabel(value, lang) : text.all}
              </button>
            ))}
          </div>
        </FilterPanel>
      </div>

      <div className="relative">
        <button type="button" id={`${baseId}-seats`} className={chipClass(seatsActive, openKey === "seats")} onClick={() => openPanel("seats")}>
          {seatsActive ? `${query.seatsMin}+` : text.seats}
          <span aria-hidden>▾</span>
        </button>
        <FilterPanel open={openKey === "seats"} onClose={() => setOpenKey(null)} labelledBy={`${baseId}-seats`}>
          <label className="grid gap-1 text-xs font-semibold text-muted">
            {text.from}
            <input
              inputMode="numeric"
              className={input}
              value={draft.seatsMin ?? ""}
              onChange={(event) => setDraft((current) => ({ ...current, seatsMin: event.target.value ? Number(event.target.value) : null }))}
            />
          </label>
          <div className="mt-3 flex gap-2">
            <button type="button" className={applyBtn} onClick={() => navigate(draft)}>
              {text.applyFilters}
            </button>
            <button type="button" className={clearBtn} onClick={() => navigate({ ...query, seatsMin: null })}>
              {text.reset}
            </button>
          </div>
        </FilterPanel>
      </div>

      <div className="relative">
        <button type="button" id={`${baseId}-transmission`} className={chipClass(transmissionActive, openKey === "transmission")} onClick={() => openPanel("transmission")}>
          {transmissionActive ? transmissionLabel(query.transmission as "automatic", lang) : text.transmission}
          <span aria-hidden>▾</span>
        </button>
        <FilterPanel open={openKey === "transmission"} onClose={() => setOpenKey(null)} labelledBy={`${baseId}-transmission`}>
          <div className="grid gap-1">
            {(["", "automatic", "manual"] as const).map((value) => (
              <button
                key={value || "all"}
                type="button"
                className={`px-3 py-2.5 text-left text-sm ${(draft.transmission || "") === value ? "bg-[#eef1f5] font-semibold" : "hover:bg-[#f6f7f9]"}`}
                onClick={() => navigate({ ...query, transmission: value })}
              >
                {value ? transmissionLabel(value, lang) : text.all}
              </button>
            ))}
          </div>
        </FilterPanel>
      </div>

      <div className="relative">
        <button type="button" id={`${baseId}-status`} className={chipClass(statusActive, openKey === "status")} onClick={() => openPanel("status")}>
          {statusActive ? statusLabel(query.status as "available", lang) : text.status}
          <span aria-hidden>▾</span>
        </button>
        <FilterPanel open={openKey === "status"} onClose={() => setOpenKey(null)} labelledBy={`${baseId}-status`}>
          <div className="grid gap-1">
            {(["", "available", "reserved", "sold"] as const).map((value) => (
              <button
                key={value || "all"}
                type="button"
                className={`px-3 py-2.5 text-left text-sm ${(draft.status || "") === value ? "bg-[#eef1f5] font-semibold" : "hover:bg-[#f6f7f9]"}`}
                onClick={() => navigate({ ...query, status: value })}
              >
                {value ? statusLabel(value, lang) : text.all}
              </button>
            ))}
          </div>
        </FilterPanel>
      </div>
    </div>
  );
}
