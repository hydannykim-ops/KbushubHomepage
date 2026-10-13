import Link from "next/link";
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
    <footer className="mt-16 border-t border-line bg-white pb-24 lg:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-4">
        <div>
          <p className="text-sm font-semibold">{name || "K-BUS HUB"}</p>
          {!settings.phone && !settings.email && !address ? (
            <p className="mt-3 text-sm leading-6 text-muted">{dict.home.companyEmpty}</p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted">{dict.common.sample}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">{dict.footer.stock}</p>
          <ul className="mt-3 grid gap-2 text-sm">
            <li><Link href={hrefFor(lang, "/inventory", trade)}>{dict.nav.inventory}</Link></li>
            <li><Link href={hrefFor(lang, "/inventory", trade, { class: "county" })}>{dict.nav.county}</Link></li>
            <li><Link href={hrefFor(lang, "/buses", trade)}>{dict.nav.buses}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">{dict.footer.help}</p>
          <ul className="mt-3 grid gap-2 text-sm">
            <li><Link href={hrefFor(lang, "/guide", trade)}>{dict.nav.guide}</Link></li>
            <li><Link href={hrefFor(lang, "/request", trade)}>{dict.home.requestCta}</Link></li>
            <li><Link href={hrefFor(lang, "/sell", trade)}>{dict.nav.sell}</Link></li>
            <li><Link href={hrefFor(lang, "/inquiry", trade)}>{dict.footer.inquiry}</Link></li>
            <li><Link href={hrefFor(lang, "/partners", trade)}>{dict.nav.partners}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">{dict.footer.company}</p>
          <dl className="mt-3 grid gap-2 text-sm">
            <div><dt className="text-xs text-muted">{dict.detail.location}</dt><dd>{line(address, dict.common.unset)}</dd></div>
            <div><dt className="text-xs text-muted">{dict.detail.phone}</dt><dd>{line(settings.phone, dict.common.unset)}</dd></div>
            <div><dt className="text-xs text-muted">Email</dt><dd>{line(settings.email, dict.common.unset)}</dd></div>
            <div><dt className="text-xs text-muted">Hours</dt><dd>{line(hours, dict.common.unset)}</dd></div>
          </dl>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs text-muted">
          <p>K-BUS HUB · {dict.footer.rights}</p>
          <Link href={hrefFor(lang, "/privacy", trade)}>{dict.footer.privacy}</Link>
        </div>
      </div>
    </footer>
  );
}
