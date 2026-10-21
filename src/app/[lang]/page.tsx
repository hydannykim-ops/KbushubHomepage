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
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-6 sm:gap-14 sm:py-10 md:gap-16 md:py-14">
      <section className="relative min-h-[22rem] overflow-hidden border border-line bg-[#0f172a] text-white sm:min-h-[28rem] lg:min-h-[32rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/demo/hero-yard.jpg" alt={text.mediaHero} className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35 sm:bg-gradient-to-r sm:from-black/75 sm:via-black/55 sm:to-black/25" />
        <div className="relative flex min-h-[22rem] max-w-2xl flex-col justify-end px-4 py-8 sm:min-h-[28rem] sm:justify-center sm:px-6 sm:py-14 lg:min-h-[32rem] lg:px-10">
          <p className="text-xs font-semibold tracking-[0.22em] text-white/90 sm:text-sm sm:tracking-[0.28em]">K-BUS HUB</p>
          <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">{text.heroTitle}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:mt-5 sm:text-base sm:leading-7">{text.heroBody}</p>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:flex sm:flex-wrap sm:gap-3">
            <Link href={hrefTo(lang, "/vehicles", ctx)} className="bg-primary px-4 py-3 text-center text-sm font-semibold text-white sm:px-5">
              {text.browseInventory}
            </Link>
            <Link href={hrefTo(lang, "/vehicles", ctx, { class: "county" })} className="border border-white/40 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur-sm sm:px-5">
              {text.classCounty}
            </Link>
          </div>
        </div>
        <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate bg-white/90 px-2 py-1 text-[10px] font-semibold text-muted sm:bottom-3 sm:left-3 sm:max-w-none sm:text-[11px]">{text.placeholderNote}</span>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {(
          [
            [...classes[0], "/demo/county-cover.jpg"],
            [...classes[1], "/demo/medium-cover.jpg"],
            [...classes[2], "/demo/large-cover.jpg"],
          ] as const
        ).map(([title, body, slot, href, image]) => (
          <Link key={title} href={href} className="overflow-hidden border border-line bg-white">
            <div className="relative aspect-[16/9] overflow-hidden bg-[#f3f5f8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={slot} className="h-full w-full object-cover" />
              <span className="sr-only">{text.placeholderNote}</span>
            </div>
            <div className="p-5">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </div>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">{text.newArrivals}</h2>
        {fresh.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {fresh.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} mode={ctx.mode} href={cardHref(vehicle)} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted">{text.noVehicles}</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">{text.featured}</h2>
        {featured.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} mode={ctx.mode} href={cardHref(vehicle)} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted">{text.noVehicles}</p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href={hrefTo(lang, "/wanted", ctx)} className="border border-line bg-white p-6">
          <h2 className="text-xl font-semibold">{text.wantedTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{text.wantedBody}</p>
        </Link>
        <Link href={hrefTo(lang, "/sell", ctx)} className="border border-line bg-white p-6">
          <h2 className="text-xl font-semibold">{text.sellTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{text.sellBody}</p>
        </Link>
      </section>

      <section className="grid gap-6 border border-line bg-white p-6 md:grid-cols-[0.8fr_1.2fr]">
        <div className="relative min-h-48 overflow-hidden border border-line bg-[#f3f5f8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/demo/hero-yard.jpg" alt={text.mediaYard} className="h-full min-h-48 w-full object-cover" />
          <span className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 text-[11px] font-semibold text-muted">{text.placeholderNote}</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold">{text.companyTitle}</h2>
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
