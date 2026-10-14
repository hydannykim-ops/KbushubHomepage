"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Lang, TradeMode } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";

export function Header({
  lang,
  defaultMode,
  refCode,
}: {
  lang: Lang;
  defaultMode: TradeMode;
  refCode: string | null;
}) {
  const text = copy(lang);
  const pathname = usePathname();
  const params = useSearchParams();
  const mode: TradeMode = params.get("mode") === "export" || params.get("mode") === "domestic" ? (params.get("mode") as TradeMode) : defaultMode;
  const ref = params.get("ref") || refCode || "";

  function href(path: string, extra?: Record<string, string>) {
    const query = new URLSearchParams();
    query.set("mode", extra?.mode ?? mode);
    if (ref) query.set("ref", ref);
    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        if (key !== "mode" && value) query.set(key, value);
      }
    }
    return `/${lang}${path}?${query.toString()}`;
  }

  function switchLang(next: Lang) {
    const parts = pathname.split("/");
    parts[1] = next;
    const query = new URLSearchParams(params.toString());
    query.set("mode", mode);
    if (ref) query.set("ref", ref);
    return `${parts.join("/") || `/${next}`}?${query.toString()}`;
  }

  const links = [
    [text.navVehicles, href("/vehicles")],
    [text.navCounty, href("/vehicles", { class: "county" })],
    [text.navBuses, href("/buses")],
    [text.navSell, href("/sell")],
    [text.navGuide, href("/guide")],
    [text.navPartner, href("/partner")],
  ] as const;

  const bar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-md border border-line p-0.5 text-sm" role="group" aria-label={text.language}>
        <Link className={lang === "ko" ? "rounded bg-foreground px-2 py-1 text-white" : "rounded px-2 py-1"} href={switchLang("ko")}>
          KO
        </Link>
        <Link className={lang === "en" ? "rounded bg-foreground px-2 py-1 text-white" : "rounded px-2 py-1"} href={switchLang("en")}>
          EN
        </Link>
      </div>
      <div className="flex rounded-md border border-line p-0.5 text-sm" role="group" aria-label={text.modeDomestic}>
        <Link className={mode === "domestic" ? "rounded bg-primary px-2 py-1 text-white" : "rounded px-2 py-1"} href={href(pathname.replace(/^\/(ko|en)/, "") || "", { mode: "domestic" })}>
          {text.modeDomestic}
        </Link>
        <Link className={mode === "export" ? "rounded bg-primary px-2 py-1 text-white" : "rounded px-2 py-1"} href={href(pathname.replace(/^\/(ko|en)/, "") || "", { mode: "export" })}>
          {text.modeExport}
        </Link>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href={href("")} className="text-lg font-bold tracking-wide text-foreground">
          K-BUS HUB
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium md:flex" aria-label="main">
          {links.map(([label, hrefValue]) => (
            <Link key={label} href={hrefValue} className="hover:text-primary">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">{bar}</div>
        <details className="md:hidden">
          <summary className="cursor-pointer rounded-md border border-line px-3 py-2 text-sm">{text.menu}</summary>
          <div className="absolute inset-x-0 top-full border-b border-line bg-white px-4 py-3">
            <nav className="grid gap-2 text-sm" aria-label="main mobile">
              {links.map(([label, hrefValue]) => (
                <Link key={label} href={hrefValue}>
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-3">{bar}</div>
          </div>
        </details>
      </div>
    </header>
  );
}

export function Footer({
  lang,
  mode,
  refCode,
  company,
}: {
  lang: Lang;
  mode: TradeMode;
  refCode: string | null;
  company: { name: string; phone: string | null; email: string | null; address: string | null };
}) {
  const text = copy(lang);
  const query = new URLSearchParams({ mode });
  if (refCode) query.set("ref", refCode);
  const href = (path: string) => `/${lang}${path}?${query.toString()}`;
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm md:grid-cols-3">
        <div>
          <p className="text-base font-bold">K-BUS HUB</p>
          <p className="mt-2 text-muted">{text.footerNote}</p>
        </div>
        <div className="grid gap-1">
          <Link href={href("/vehicles")}>{text.navVehicles}</Link>
          <Link href={href("/guide")}>{text.navGuide}</Link>
          <Link href={href("/privacy")}>{text.privacyTitle}</Link>
          <Link href={href("/agent/login")}>{text.navAgent}</Link>
        </div>
        <div className="text-muted">
          <p className="font-medium text-foreground">{company.name}</p>
          {company.address ? <p>{company.address}</p> : null}
          {company.phone ? <p>{company.phone}</p> : null}
          {company.email ? <p>{company.email}</p> : null}
          {!company.address && !company.phone && !company.email ? <p>{text.companyMissing}</p> : null}
        </div>
      </div>
    </footer>
  );
}
