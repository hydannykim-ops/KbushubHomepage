"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { hrefFor, swapLang } from "@/lib/paths";
import type { Locale, TradeMode } from "@/lib/types";

export function SiteHeader({ lang, trade }: { lang: Locale; trade: TradeMode }) {
  const dict = getDict(lang);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const currentTrade: TradeMode =
    searchParams.get("trade") === "export" || searchParams.get("trade") === "domestic"
      ? (searchParams.get("trade") as TradeMode)
      : trade;
  const links = [
    [dict.nav.inventory, hrefFor(lang, "/inventory", currentTrade)],
    [dict.nav.county, hrefFor(lang, "/inventory", currentTrade, { class: "county" })],
    [dict.nav.buses, hrefFor(lang, "/buses", currentTrade)],
    [dict.nav.sell, hrefFor(lang, "/sell", currentTrade)],
    [dict.nav.guide, hrefFor(lang, "/guide", currentTrade)],
    [dict.nav.partners, hrefFor(lang, "/partners", currentTrade)],
  ];

  function tradeHref(next: TradeMode) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("trade", next);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <a
        href="#main"
        className="absolute left-4 top-2 z-50 -translate-y-16 bg-white px-3 py-2 text-sm focus:translate-y-0"
      >
        {dict.a11y.skip}
      </a>
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
        <Link href={hrefFor(lang, "/", currentTrade)} className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center bg-ink text-xs font-semibold text-white">KB</span>
          <span className="text-[15px] font-semibold tracking-tight">K-BUS HUB</span>
        </Link>
        <nav aria-label={dict.a11y.nav} className="ml-4 hidden items-center gap-5 min-[1100px]:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="text-sm font-medium text-ink hover:text-blue">
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex border border-line text-sm" role="group" aria-label={dict.a11y.trade}>
            {(["domestic", "export"] as const).map((mode) => (
              <Link
                key={mode}
                href={tradeHref(mode)}
                aria-current={currentTrade === mode ? "true" : undefined}
                className={`px-3 py-1.5 ${currentTrade === mode ? "bg-ink text-white" : "text-muted"}`}
              >
                {dict.trade[mode]}
              </Link>
            ))}
          </div>
          <div className="flex border border-line text-sm" role="group" aria-label={dict.a11y.lang}>
            {(["ko", "en"] as const).map((next) => (
              <Link
                key={next}
                href={swapLang(pathname, `?${searchParams.toString()}`, next)}
                hrefLang={next}
                aria-current={lang === next ? "true" : undefined}
                className={`px-2.5 py-1.5 font-mono text-xs ${lang === next ? "bg-ink text-white" : "text-muted"}`}
              >
                {dict.lang[next]}
              </Link>
            ))}
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center border border-line min-[1100px]:hidden"
            aria-expanded={open}
            aria-label={open ? dict.a11y.close : dict.a11y.menu}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? dict.a11y.close : dict.a11y.menu}</span>
            <span aria-hidden="true" className="text-lg leading-none">
              {open ? "×" : "☰"}
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <nav aria-label={dict.a11y.nav} className="border-t border-line bg-white px-5 py-3 min-[1100px]:hidden">
          <ul className="grid gap-1">
            {links.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
