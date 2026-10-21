"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CountryFlag } from "@/components/country-flag";
import { countries, countryDial, countryLabel } from "@/lib/domain/countries";
import type { Lang } from "@/lib/domain/types";

function Dial({ code }: { code: string }) {
  const dial = countryDial(code);
  if (!dial) return null;
  return <span className="text-[11px] font-normal tabular-nums text-muted">+{dial}</span>;
}

function OptionRow({ code, lang }: { code: string; lang: Lang }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <CountryFlag code={code} lang={lang} />
      <span className="truncate font-normal">{countryLabel(code, lang)}</span>
      <Dial code={code} />
    </span>
  );
}

export function CountrySelect({
  lang,
  name = "country",
  label,
  required = false,
  defaultValue = "",
  className = "rounded-md border border-line px-3 py-2 font-normal",
}: {
  lang: Lang;
  name?: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState("");

  const selected = value ? countries.find((item) => item.code === value) : null;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((item) => {
      const hay = `${item.code} ${item.ko} ${item.en} ${item.dial ?? ""} +${item.dial ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  useEffect(() => {
    if (selectRef.current) selectRef.current.value = value;
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} data-country-select={name} className="grid gap-1 text-sm font-medium">
      <span id={`${listId}-label`}>{label}</span>
      {/* Keeps FormData + HTML5 required validation working. */}
      <select
        ref={selectRef}
        name={name}
        required={required}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        <option value="">{lang === "ko" ? "국가 선택" : "Select a country"}</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {countryLabel(country.code, lang)}
          </option>
        ))}
      </select>
      <button
        type="button"
        data-country-trigger={name}
        aria-labelledby={`${listId}-label`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`${className} flex w-full items-center justify-between gap-2 text-left`}
        onClick={() => {
          setOpen((prev) => !prev);
          setQuery("");
        }}
      >
        {selected ? (
          <OptionRow code={selected.code} lang={lang} />
        ) : (
          <span className="font-normal text-muted">{lang === "ko" ? "국가 선택" : "Select a country"}</span>
        )}
        <span className="shrink-0 text-xs text-muted" aria-hidden="true">
          ▾
        </span>
      </button>
      {open ? (
        <div className="relative z-20">
          <div className="absolute inset-x-0 top-1 overflow-hidden rounded-md border border-line bg-white shadow-sm">
            <div className="border-b border-line p-2">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={lang === "ko" ? "국가·번호 검색" : "Search country or code"}
                className="w-full rounded-md border border-line px-2 py-1.5 text-sm font-normal"
              />
            </div>
            <ul id={listId} role="listbox" className="max-h-64 overflow-auto py-1">
              {filtered.length ? (
                filtered.map((country) => {
                  const active = country.code === value;
                  return (
                    <li key={country.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`flex w-full items-center px-3 py-2 text-left hover:bg-[#f3f6fb] ${active ? "bg-[#e8eef8]" : ""}`}
                        onClick={() => {
                          setValue(country.code);
                          setOpen(false);
                          setQuery("");
                        }}
                      >
                        <OptionRow code={country.code} lang={lang} />
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-2 text-sm font-normal text-muted">{lang === "ko" ? "검색 결과 없음" : "No matches"}</li>
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
