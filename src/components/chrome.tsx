"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LogoSlot } from "@/components/media-slot";
import type { Lang, SessionRole, TradeMode } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { langs, langMeta, langPathPattern } from "@/lib/i18n/langs";

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 12h17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9s1.2-6.4 3.6-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

function LanguageMenu({
  lang,
  label,
  switchLang,
  align = "right",
  onPicked,
}: {
  lang: Lang;
  label: string;
  switchLang: (next: Lang) => string;
  align?: "left" | "right";
  onPicked?: () => void;
}) {
  const rootRef = useRef<HTMLDetailsElement>(null);
  const listId = useId();
  const current = langMeta[lang];

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const node = rootRef.current;
      if (!node?.open) return;
      if (!node.contains(event.target as Node)) node.open = false;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && rootRef.current) rootRef.current.open = false;
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <details className="relative" ref={rootRef} data-language-menu>
      <summary
        className="inline-flex cursor-pointer list-none items-center gap-1.5 border border-line px-2.5 py-1.5 text-sm text-foreground hover:border-ink [&::-webkit-details-marker]:hidden"
        aria-label={label}
        aria-controls={listId}
      >
        <GlobeIcon className="h-4 w-4 shrink-0" />
        <span className="max-w-[5.5rem] truncate font-medium">{current.native}</span>
      </summary>
      <div
        id={listId}
        role="listbox"
        aria-label={label}
        className={`absolute top-[calc(100%+0.35rem)] z-50 max-h-56 w-56 overflow-y-auto border border-line bg-white py-1 shadow-[0_8px_24px_rgba(16,32,51,0.12)] ${
          align === "right" ? "right-0" : "left-0"
        }`}
      >
        {langs.map((code) => {
          const meta = langMeta[code];
          const active = code === lang;
          return (
            <Link
              key={code}
              role="option"
              aria-selected={active}
              href={switchLang(code)}
              className={`flex items-baseline justify-between gap-3 px-3 py-2 text-sm hover:bg-[#f3f5f8] ${
                active ? "bg-[#f3f5f8] font-semibold text-ink" : "text-foreground"
              }`}
              onClick={() => {
                if (rootRef.current) rootRef.current.open = false;
                onPicked?.();
              }}
            >
              <span>{meta.native}</span>
              <span className="shrink-0 text-[11px] text-muted">{meta.short}</span>
            </Link>
          );
        })}
      </div>
    </details>
  );
}

function shortLabel(label: string, lang: Lang, kind: "domestic" | "export") {
  if (!label) return label;
  if (lang === "ko") return kind === "domestic" ? "국내" : "수입";
  const part = label.split(/[\s·/_-]+/)[0];
  return part || label;
}

function ModeToggle({
  mode,
  pathname,
  text,
  href,
  lang,
  compact = false,
  onPicked,
}: {
  mode: TradeMode;
  pathname: string;
  text: ReturnType<typeof copy>;
  href: (path: string, extra?: Record<string, string>) => string;
  lang: Lang;
  compact?: boolean;
  onPicked?: () => void;
}) {
  const stripped = pathname.replace(new RegExp(`^/(${langPathPattern})`), "") || "";
  const pad = compact ? "px-2 py-1 text-xs" : "px-2.5 py-1 text-sm";
  const domestic = compact ? shortLabel(text.modeDomestic, lang, "domestic") : text.modeDomestic;
  const exported = compact ? shortLabel(text.modeExport, lang, "export") : text.modeExport;
  return (
    <div className="flex shrink-0 border border-line p-0.5" role="group" aria-label={text.modeDomestic}>
      <Link
        className={mode === "domestic" ? `bg-primary ${pad} font-medium text-white` : `${pad} text-foreground`}
        href={href(stripped, { mode: "domestic" })}
        onClick={onPicked}
      >
        {domestic}
      </Link>
      <Link
        className={mode === "export" ? `bg-primary ${pad} font-medium text-white` : `${pad} text-foreground`}
        href={href(stripped, { mode: "export" })}
        onClick={onPicked}
      >
        {exported}
      </Link>
    </div>
  );
}

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
  const pathname = usePathname() || `/${lang}`;
  const mode = defaultMode;
  const ref = refCode || "";
  const signedIn = member?.role === "customer" || member?.role === "dealer";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

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
    const query = new URLSearchParams();
    query.set("mode", mode);
    if (ref) query.set("ref", ref);
    return `${parts.join("/") || `/${next}`}?${query.toString()}`;
  }

  const links = [
    [text.navVehicles, href("/vehicles")],
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

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:gap-4 sm:py-3">
        <Link href={href("")} className="flex min-w-0 items-center gap-2.5 text-foreground sm:gap-3" onClick={() => setMenuOpen(false)}>
          <LogoSlot label={text.mediaLogo} />
          <span className="min-w-0 truncate text-[1.05rem] font-semibold tracking-wide sm:hidden">K-BUS HUB</span>
          <span className="hidden min-w-0 sm:block">
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
          <div className="flex flex-wrap items-center gap-2">
            <LanguageMenu lang={lang} label={text.language} switchLang={switchLang} />
            <ModeToggle mode={mode} pathname={pathname} text={text} href={href} lang={lang} />
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-line text-ink md:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={text.menu}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen ? (
        <div id={menuId} className="border-t border-line bg-white md:hidden">
          <div className="mx-auto grid max-w-6xl gap-1 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="mb-1 px-1">
              <ModeToggle mode={mode} pathname={pathname} text={text} href={href} lang={lang} onPicked={() => setMenuOpen(false)} />
            </div>
            <nav className="grid gap-0.5 border-t border-line pt-2" aria-label="main mobile">
              {links.map(([label, hrefValue]) => (
                <Link
                  key={label}
                  href={hrefValue}
                  className="rounded-md px-3 py-3 text-base font-medium text-ink hover:bg-[#f3f5f8]"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {accountLinks.map(([label, hrefValue]) => (
                <Link
                  key={label}
                  href={hrefValue}
                  className="rounded-md px-3 py-3 text-base font-semibold text-ink hover:bg-[#f3f5f8]"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-line px-1 pt-3">
              <LanguageMenu lang={lang} label={text.language} switchLang={switchLang} align="left" onPicked={() => setMenuOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
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
    <footer className="mt-10 bg-ink text-white sm:mt-20">
      <div className="mx-auto grid max-w-6xl gap-7 px-4 py-9 text-sm sm:gap-8 sm:py-10 md:grid-cols-3">
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
          <p className="text-white/70">{lang === "ko" ? "사업자등록번호 445-08-03206" : "Business Reg. No. 445-08-03206"}</p>
          {company.address ? <p>{company.address}</p> : null}
          {company.phone ? <p>{company.phone}</p> : null}
          {company.email ? <p>{company.email}</p> : null}
          {!company.address && !company.phone && !company.email ? <p>{text.companyMissing}</p> : null}
        </div>
      </div>
    </footer>
  );
}
