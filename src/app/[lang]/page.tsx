import Link from "next/link";
import { notFound } from "next/navigation";
import { DataProblem, VehicleCard } from "@/components/catalog";
import { copy } from "@/lib/i18n";
import { contentFieldLang } from "@/lib/i18n/langs";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";
import type { PublicVehicle } from "@/lib/domain/types";

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: raw } = await params;
  const lang = parseLang(raw);
  if (!lang) notFound();
  const sp = new URLSearchParams();
  const rawParams = await searchParams;
  for (const [key, value] of Object.entries(rawParams)) if (typeof value === "string") sp.set(key, value);
  const ctx = await requestContext(lang, sp);
  const site = await loadSite();
  const text = copy(lang);
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;

  const listed = await site.repo.listPublic({}, ctx.mode);
  const fresh = listed.items.filter((vehicle) => vehicle.status !== "sold").slice(0, 4);
  const featured = listed.items.filter((vehicle) => vehicle.featured).slice(0, 4);
  const cardHref = (vehicle: PublicVehicle) => hrefTo(lang, `/vehicles/${vehicle.stockNo}`, ctx);
  const classes = [
    [text.classCounty, text.classCountyBody, text.mediaCounty, hrefTo(lang, "/vehicles", ctx, { class: "county" })],
    [text.classMedium, text.classMediumBody, text.mediaMedium, hrefTo(lang, "/vehicles", ctx, { class: "medium" })],
    [text.classLarge, text.classLargeBody, text.mediaLarge, hrefTo(lang, "/vehicles", ctx, { class: "large" })],
  ] as const;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 sm:gap-14 sm:px-4 sm:py-10 md:gap-16 md:py-14">
      <section className="relative min-h-[min(28rem,calc(100svh-9rem))] overflow-hidden bg-[#0f172a] text-white sm:min-h-[28rem] sm:border sm:border-line lg:min-h-[32rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/demo/hero-yard.jpg"
          alt={text.mediaHero}
          className="absolute inset-0 h-full w-full object-cover object-[center_40%] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/30 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/55 sm:to-black/25" />
        <div className="relative flex min-h-[min(28rem,calc(100svh-9rem))] max-w-2xl flex-col justify-end px-5 pb-8 pt-14 sm:min-h-[28rem] sm:justify-center sm:px-6 sm:py-14 lg:min-h-[32rem] lg:px-10">
          <p className="hero-reveal text-xs font-semibold tracking-[0.22em] text-white sm:text-sm sm:tracking-[0.28em]">K-BUS HUB</p>
          <h1 className="hero-reveal hero-reveal-delay-1 mt-2.5 max-w-[12ch] text-[1.7rem] font-semibold leading-[1.18] tracking-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] sm:mt-4 sm:max-w-none sm:text-4xl md:text-5xl">
            {text.heroTitle}
          </h1>
          <p className="hero-reveal hero-reveal-delay-2 mt-2.5 line-clamp-2 max-w-xl text-sm leading-6 text-white/90 sm:mt-5 sm:line-clamp-none sm:text-base sm:leading-7">
            {text.heroBody}
          </p>
          <div className="hero-reveal hero-reveal-delay-3 mt-5 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
            <Link
              href={hrefTo(lang, "/vehicles", ctx)}
              className="bg-primary px-5 py-3.5 text-center text-sm font-semibold text-white sm:px-5 sm:py-3"
            >
              {text.browseInventory}
            </Link>
            <Link
              href={hrefTo(lang, "/vehicles", ctx, { class: "county" })}
              className="border border-white/40 bg-white/15 px-5 py-3 text-center text-sm font-semibold text-white backdrop-blur-sm sm:px-5"
            >
              {text.classCounty}
            </Link>
          </div>
        </div>
        <span className="pointer-events-none absolute left-3 top-3 max-w-[min(14rem,calc(100%-1.5rem))] truncate bg-black/50 px-2 py-1 text-[10px] font-medium text-white/85 sm:bottom-3 sm:left-3 sm:top-auto sm:max-w-none sm:bg-white/90 sm:font-semibold sm:text-muted">
          {text.placeholderNote}
        </span>
      </section>

      <section className="grid gap-0 px-4 sm:gap-4 sm:px-0 md:grid-cols-3">
        {(
          [
            [...classes[0], "/demo/county-cover.jpg"],
            [...classes[1], "/demo/medium-cover.jpg"],
            [...classes[2], "/demo/large-cover.jpg"],
          ] as const
        ).map(([title, body, slot, href, image], index) => (
          <Link
            key={title}
            href={href}
            className={`group grid grid-cols-[6.25rem_1fr] items-center gap-3.5 border-b border-line py-4 sm:grid-cols-1 sm:gap-0 sm:overflow-hidden sm:border sm:border-line sm:bg-white sm:py-0 ${
              index === 0 ? "border-t sm:border-t" : ""
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#f3f5f8] sm:aspect-[16/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={slot} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              <span className="sr-only">{text.placeholderNote}</span>
            </div>
            <div className="min-w-0 sm:p-5">
              <h2 className="text-lg font-semibold text-ink sm:text-xl">{title}</h2>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted sm:mt-2 sm:leading-6">{body}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="px-4 sm:px-0">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{text.newArrivals}</h2>
        {fresh.length ? (
          <div className="mt-4 grid gap-5 sm:mt-5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {fresh.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} mode={ctx.mode} href={cardHref(vehicle)} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted">{text.noVehicles}</p>
        )}
      </section>

      <section className="px-4 sm:px-0">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{text.featured}</h2>
        {featured.length ? (
          <div className="mt-4 grid gap-5 sm:mt-5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {featured.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} mode={ctx.mode} href={cardHref(vehicle)} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted">{text.noVehicles}</p>
        )}
      </section>

      <section className="grid gap-0 px-4 sm:gap-4 sm:px-0 md:grid-cols-2">
        <Link href={hrefTo(lang, "/wanted", ctx)} className="border-b border-line py-5 sm:border sm:border-line sm:bg-white sm:p-6">
          <h2 className="text-lg font-semibold sm:text-xl">{text.wantedTitle}</h2>
          <p className="mt-1.5 text-sm leading-6 text-muted sm:mt-2">{text.wantedBody}</p>
        </Link>
        <Link href={hrefTo(lang, "/sell", ctx)} className="border-b border-line py-5 sm:border sm:border-line sm:bg-white sm:p-6">
          <h2 className="text-lg font-semibold sm:text-xl">{text.sellTitle}</h2>
          <p className="mt-1.5 text-sm leading-6 text-muted sm:mt-2">{text.sellBody}</p>
        </Link>
      </section>

      <section className="mx-4 grid gap-5 border-t border-line bg-transparent py-8 sm:mx-0 sm:gap-6 sm:border sm:border-line sm:bg-white sm:p-6 md:grid-cols-[0.8fr_1.2fr]">
        <div className="relative min-h-44 overflow-hidden bg-[#f3f5f8] sm:min-h-48 sm:border sm:border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/demo/hero-yard.jpg" alt={text.mediaYard} className="h-full min-h-44 w-full object-cover sm:min-h-48" />
          <span className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 text-[11px] font-semibold text-muted">{text.placeholderNote}</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold sm:text-xl">{text.companyTitle}</h2>
          <p className="mt-3 text-sm leading-6">{contentFieldLang(lang) === "ko" ? site.settings.aboutKo : site.settings.aboutEn}</p>
          <div className="mt-4 text-sm text-muted">
            {site.settings.address ? <p>{site.settings.address}</p> : null}
            {site.settings.phone ? <p>{site.settings.phone}</p> : null}
            {site.settings.email ? <p>{site.settings.email}</p> : null}
            {site.settings.businessHours ? (
              <p>
                {text.hours}: {site.settings.businessHours}
              </p>
            ) : null}
            {!site.settings.phone && !site.settings.email && !site.settings.address ? <p>{text.companyMissing}</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
