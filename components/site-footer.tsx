import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
import { getDict } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import type { Locale, Settings, TradeMode } from "@/lib/types";

function line(value: string, empty: string) {
  return value.trim() ? value : empty;
}

export function SiteFooter({
  lang,
  trade,
  settings,
}: {
  lang: Locale;
  trade: TradeMode;
  settings: Settings;
}) {
  const dict = getDict(lang);
  const name = lang === "ko" ? settings.companyNameKo : settings.companyNameEn;
  const address = lang === "ko" ? settings.addressKo : settings.addressEn;
  const hours = lang === "ko" ? settings.hoursKo : settings.hoursEn;
  return (
    <footer className="mt-20 bg-ink pb-24 text-white lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-12 lg:px-8">
        <div className="md:col-span-4">
          <div className="flex items-center gap-3">
            <LogoMark light />
            <p className="text-sm font-semibold tracking-[-0.02em]">{name || "K-BUS HUB"}</p>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
            {!settings.phone && !settings.email && !address ? dict.home.companyEmpty : dict.common.sample}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-[12px] font-medium tracking-[0.16em] text-white/45">{dict.footer.stock}</p>
          <ul className="mt-4 grid gap-2.5 text-sm text-white/80">
            <li><Link className="hover:text-white" href={hrefFor(lang, "/inventory", trade)}>{dict.nav.inventory}</Link></li>
            <li><Link className="hover:text-white" href={hrefFor(lang, "/inventory", trade, { class: "county" })}>{dict.nav.county}</Link></li>
            <li><Link className="hover:text-white" href={hrefFor(lang, "/buses", trade)}>{dict.nav.buses}</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="text-[12px] font-medium tracking-[0.16em] text-white/45">{dict.footer.help}</p>
          <ul className="mt-4 grid gap-2.5 text-sm text-white/80">
            <li><Link className="hover:text-white" href={hrefFor(lang, "/guide", trade)}>{dict.nav.guide}</Link></li>
            <li><Link className="hover:text-white" href={hrefFor(lang, "/request", trade)}>{dict.home.requestCta}</Link></li>
            <li><Link className="hover:text-white" href={hrefFor(lang, "/sell", trade)}>{dict.nav.sell}</Link></li>
            <li><Link className="hover:text-white" href={hrefFor(lang, "/inquiry", trade)}>{dict.footer.inquiry}</Link></li>
            <li><Link className="hover:text-white" href={hrefFor(lang, "/partners", trade)}>{dict.nav.partners}</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="text-[12px] font-medium tracking-[0.16em] text-white/45">{dict.footer.company}</p>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-[12px] text-white/45">{dict.detail.location}</dt>
              <dd className="mt-0.5 text-white/85">{line(address, dict.common.unset)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-white/45">{dict.detail.phone}</dt>
              <dd className="mt-0.5 text-white/85">{line(settings.phone, dict.common.unset)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-white/45">Email</dt>
              <dd className="mt-0.5 text-white/85">{line(settings.email, dict.common.unset)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-white/45">Hours</dt>
              <dd className="mt-0.5 text-white/85">{line(hours, dict.common.unset)}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-white/50 lg:px-8">
          <p>K-BUS HUB · {dict.footer.rights}</p>
          <Link className="hover:text-white" href={hrefFor(lang, "/privacy", trade)}>{dict.footer.privacy}</Link>
        </div>
      </div>
    </footer>
  );
}
