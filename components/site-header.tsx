"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LogoMark } from "@/components/logo-mark";
import { getDict } from "@/lib/i18n";
import { hrefFor, swapLang } from "@/lib/paths";
import type { Locale, TradeMode } from "@/lib/types";

function Segment({
  label,
  options,
}: {
  label: string;
  options: { key: string; href: string; current: boolean; text: string; lang?: string }[];
}) {
  return (
    <div className="flex items-center rounded-full bg-sand p-1" role="group" aria-label={label}>
      {options.map((option) => (
        <Link
          key={option.key}
          href={option.href}
          hrefLang={option.lang}
          aria-current={option.current ? "true" : undefined}
          className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${
            option.current ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          {option.text}
        </Link>
      ))}
    </div>
  );
}

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

  const tradeOptions = (["domestic", "export"] as const).map((mode) => ({
    key: mode,
    href: tradeHref(mode),
    current: currentTrade === mode,
    text: dict.trade[mode],
  }));
  const langOptions = (["ko", "en"] as const).map((next) => ({
    key: next,
    href: swapLang(pathname, `?${searchParams.toString()}`, next),
    current: lang === next,
    text: dict.lang[next],
    lang: next,
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-card">
      <a
        href="#main"
        className="absolute left-4 top-2 z-50 -translate-y-16 rounded-full bg-card px-3 py-2 text-sm shadow-card focus:translate-y-0"
      >
        {dict.a11y.skip}
      </a>
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex h-16 items-center gap-6 lg:h-[4.5rem]">
          <Link href={hrefFor(lang, "/", currentTrade)} className="flex items-center gap-3">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-[-0.03em]">K-BUS HUB</span>
          </Link>
          <nav aria-label={dict.a11y.nav} className="ml-2 hidden items-center gap-6 min-[1100px]:flex">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="text-sm text-muted hover:text-ink">
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 min-[1100px]:flex">
            <Segment label={dict.a11y.trade} options={tradeOptions} />
            <Segment label={dict.a11y.lang} options={langOptions} />
          </div>
          <button
            type="button"
            className="ml-auto grid h-11 w-11 place-items-center rounded-full bg-sand text-ink min-[1100px]:hidden"
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
        <div className="flex items-center justify-between gap-3 border-t border-line/70 py-2 min-[1100px]:hidden">
          <Segment label={dict.a11y.trade} options={tradeOptions} />
          <Segment label={dict.a11y.lang} options={langOptions} />
        </div>
      </div>
      {open ? (
        <nav aria-label={dict.a11y.nav} className="border-t border-line bg-card px-5 py-3 min-[1100px]:hidden">
          <ul className="mx-auto grid max-w-7xl">
            {links.map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block py-3 text-lg font-medium tracking-[-0.02em]"
                  onClick={() => setOpen(false)}
                >
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
