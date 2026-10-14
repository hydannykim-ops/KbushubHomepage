"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LogoSlot } from "@/components/media-slot";
import type { Lang, SessionRole, TradeMode } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";

export function Header({
  lang,
  defaultMode,
  refCode,
  member,
}: {
  lang: Lang;
  defaultMode: TradeMode;
  refCode: string | null;
  member: { role: SessionRole; name?: string } | null;
}) {
  const text = copy(lang);
  const pathname = usePathname();
  const params = useSearchParams();
  const mode: TradeMode = params.get("mode") === "export" || params.get("mode") === "domestic" ? (params.get("mode") as TradeMode) : defaultMode;
  const ref = params.get("ref") || refCode || "";
  const signedIn = member?.role === "customer" || member?.role === "dealer";

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

  const accountLinks = signedIn
    ? ([[text.navAccount, href("/account")]] as const)
    : ([
        [text.navLogin, href("/account/login")],
        [text.navSignup, href("/account/signup")],
      ] as const);

  const bar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex border border-line p-0.5 text-sm" role="group" aria-label={text.language}>
        <Link className={lang === "ko" ? "bg-ink px-2 py-1 text-white" : "px-2 py-1"} href={switchLang("ko")}>
          KO
        </Link>
        <Link className={lang === "en" ? "bg-ink px-2 py-1 text-white" : "px-2 py-1"} href={switchLang("en")}>
          EN
        </Link>
      </div>
      <div className="flex border border-line p-0.5 text-sm" role="group" aria-label={text.modeDomestic}>
        <Link className={mode === "domestic" ? "bg-primary px-2 py-1 text-white" : "px-2 py-1"} href={href(pathname.replace(/^\/(ko|en)/, "") || "", { mode: "domestic" })}>
          {text.modeDomestic}
        </Link>
        <Link className={mode === "export" ? "bg-primary px-2 py-1 text-white" : "px-2 py-1"} href={href(pathname.replace(/^\/(ko|en)/, "") || "", { mode: "export" })}>
          {text.modeExport}
        </Link>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={href("")} className="flex items-center gap-3 text-foreground">
          <LogoSlot label={text.mediaLogo} />
          <span>
            <span className="block text-[11px] font-semibold tracking-[0.18em] text-muted">K-BUS</span>
            <span className="block text-lg font-semibold leading-none tracking-wide">HUB</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium md:flex" aria-label="main">
          {links.map(([label, hrefValue]) => (
            <Link key={label} href={hrefValue} className="hover:text-primary">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {accountLinks.map(([label, hrefValue]) => (
            <Link key={label} href={hrefValue} className="text-sm font-semibold text-foreground hover:text-primary">
              {label}
            </Link>
          ))}
          {bar}
        </div>
        <details className="md:hidden">
          <summary className="cursor-pointer border border-line px-3 py-2 text-sm">{text.menu}</summary>
          <div className="absolute inset-x-0 top-full border-b border-line bg-white px-4 py-4">
            <nav className="grid gap-3 text-sm" aria-label="main mobile">
              {links.map(([label, hrefValue]) => (
                <Link key={label} href={hrefValue}>
                  {label}
                </Link>
              ))}
              {accountLinks.map(([label, hrefValue]) => (
                <Link key={label} href={hrefValue} className="font-semibold">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-4">{bar}</div>
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
    <footer className="mt-20 bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
        <div>
          <p className="text-base font-semibold tracking-wide">K-BUS HUB</p>
          <p className="mt-3 max-w-xs leading-6 text-white/70">{text.footerNote}</p>
        </div>
        <div className="grid content-start gap-2">
          <Link href={href("/vehicles")}>{text.navVehicles}</Link>
          <Link href={href("/sell")}>{text.navSell}</Link>
          <Link href={href("/guide")}>{text.navGuide}</Link>
          <Link href={href("/privacy")}>{text.privacyTitle}</Link>
          <Link href={href("/account/login")}>{text.navLogin}</Link>
          <Link href={href("/agent/login")}>{text.navAgent}</Link>
        </div>
        <div className="leading-6 text-white/70">
          <p className="font-medium text-white">{company.name}</p>
          {company.address ? <p>{company.address}</p> : null}
          {company.phone ? <p>{company.phone}</p> : null}
          {company.email ? <p>{company.email}</p> : null}
          {!company.address && !company.phone && !company.email ? <p>{text.companyMissing}</p> : null}
        </div>
      </div>
    </footer>
  );
}
