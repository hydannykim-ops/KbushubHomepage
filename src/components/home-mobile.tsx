import Link from "next/link";
import { VehicleCard } from "@/components/catalog";
import type { Lang, PublicVehicle, SiteSettings } from "@/lib/domain/types";
import type { Messages } from "@/lib/i18n/messages";
import { contentFieldLang } from "@/lib/i18n/langs";

type ShortcutIconName = "inventory" | "sell" | "export" | "scrap" | "wanted";

function ShortcutIcon({ name }: { name: ShortcutIconName }) {
  const common = { viewBox: "0 0 24 24", className: "h-6 w-6", fill: "none", "aria-hidden": true as const };
  if (name === "inventory") {
    return (
      <svg {...common}>
        <path d="M4 16.5V7.2L12 4l8 3.2v9.3L12 20l-8-3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M12 11.2V20M4.4 8.1 12 11.2l7.6-3.1" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "sell") {
    return (
      <svg {...common}>
        <path d="M12 4.5v15M7.5 8.2c0-1.5 1.8-2.6 4.5-2.6s4.5 1.1 4.5 2.6-1.8 2.5-4.5 2.5-4.5 1-4.5 2.6 1.8 2.6 4.5 2.6 4.5-1.1 4.5-2.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "export") {
    return (
      <svg {...common}>
        <path d="M4 12h12M12 7l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 5.5v13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "scrap") {
    return (
      <svg {...common}>
        <path d="M8 6.5h8l-.7 12.2a1.5 1.5 0 0 1-1.5 1.4H10.2a1.5 1.5 0 0 1-1.5-1.4L8 6.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M6.5 6.5h11M10 4.8h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="11" cy="11" r="5.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m15.2 15.2 3.3 3.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function Rail({
  title,
  href,
  more,
  children,
}: {
  title: string;
  href: string;
  more: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3 px-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        <Link href={href} className="shrink-0 text-sm font-semibold text-primary">
          {more}
        </Link>
      </div>
      {children}
    </section>
  );
}

export function HomeMobile({
  lang,
  text,
  vehiclesHref,
  sellHref,
  exportHref,
  scrapHref,
  wantedHref,
  classes,
  fresh,
  featured,
  cardHref,
  settings,
}: {
  lang: Lang;
  text: Messages;
  vehiclesHref: string;
  sellHref: string;
  exportHref: string;
  scrapHref: string;
  wantedHref: string;
  classes: { title: string; href: string }[];
  fresh: PublicVehicle[];
  featured: PublicVehicle[];
  cardHref: (vehicle: PublicVehicle) => string;
  settings: SiteSettings;
}) {
  const shortcuts =
    lang === "ko"
      ? [
          { href: vehiclesHref, label: text.navVehicles, icon: "inventory" as const },
          { href: sellHref, label: text.navSell, icon: "sell" as const },
          { href: exportHref, label: text.navExportSell, icon: "export" as const },
          { href: scrapHref, label: text.navScrap, icon: "scrap" as const },
        ]
      : [
          { href: vehiclesHref, label: text.navVehicles, icon: "inventory" as const },
          { href: wantedHref, label: text.navWanted, icon: "wanted" as const },
          { href: scrapHref, label: text.navScrap, icon: "scrap" as const },
        ];
  const about = contentFieldLang(lang) === "ko" ? settings.aboutKo : settings.aboutEn;

  return (
    <div className="grid grid-cols-1 gap-8 py-5">
      <section className="grid grid-cols-2 gap-2.5 px-4">
        {shortcuts.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-[6.25rem] flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-white px-2 py-3 text-center shadow-[0_6px_18px_rgba(15,28,47,0.05)]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <ShortcutIcon name={item.icon} />
            </span>
            <span className="break-keep text-sm font-semibold leading-5 tracking-tight text-ink">{item.label}</span>
          </Link>
        ))}
      </section>

      {lang === "ko" ? (
        <Link href={wantedHref} className="-mt-5 mx-4 flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink">
          <span>{text.navWanted}</span>
          <span aria-hidden="true" className="text-lg leading-none text-muted">
            ›
          </span>
        </Link>
      ) : null}

      <section>
        <h2 className="px-4 text-lg font-semibold tracking-tight text-ink">{text.classLabel}</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {classes.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink"
            >
              {item.title}
            </Link>
          ))}
          <Link href={vehiclesHref} className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
            {text.all}
          </Link>
        </div>
      </section>

      <Rail title={text.newArrivals} href={vehiclesHref} more={text.all}>
        {fresh.length ? (
          <div className="home-rail">
            {fresh.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} href={cardHref(vehicle)} listedBy={settings.companyName} />
            ))}
          </div>
        ) : (
          <p className="px-4 text-sm text-muted">{text.noVehicles}</p>
        )}
      </Rail>

      <Rail title={text.featured} href={vehiclesHref} more={text.all}>
        {featured.length ? (
          <div className="home-rail">
            {featured.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} href={cardHref(vehicle)} listedBy={settings.companyName} />
            ))}
          </div>
        ) : (
          <p className="px-4 text-sm text-muted">{text.noVehicles}</p>
        )}
      </Rail>

      <section className="mx-4 rounded-2xl border border-line bg-white p-4 shadow-[0_6px_18px_rgba(15,28,47,0.04)]">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary">K-BUS HUB</p>
        <h2 className="mt-2 text-lg font-semibold text-ink">{text.companyTitle}</h2>
        {about ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{about}</p> : null}
        <div className="mt-3 grid gap-1 text-sm leading-6 text-ink">
          {settings.address ? <p>{settings.address}</p> : null}
          {settings.phone ? (
            <p>
              {text.phone} {settings.phone}
            </p>
          ) : null}
          {settings.email ? <p>{settings.email}</p> : null}
          {settings.businessHours ? (
            <p>
              {text.hours}: {settings.businessHours}
            </p>
          ) : null}
          {!settings.phone && !settings.email && !settings.address ? <p className="text-muted">{text.companyMissing}</p> : null}
        </div>
      </section>
    </div>
  );
}
