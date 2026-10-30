import Link from "next/link";
import { notFound } from "next/navigation";
import { DataProblem, VehicleCard } from "@/components/catalog";
import { HeroBanner } from "@/components/hero-banner";
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
    <div className="mx-auto grid max-w-6xl gap-16 px-4 py-10 md:py-14">
      <HeroBanner
        prevLabel={text.heroPrev}
        nextLabel={text.heroNext}
        slides={[
          {
            id: "hub",
            image: "/demo/hero-yard.jpg",
            imageAlt: text.mediaHero,
            brand: "K-BUS HUB",
            title: text.heroTitle,
            body: text.heroBody,
            tone: "hub",
            primary: { href: hrefTo(lang, "/vehicles", ctx), label: text.browseInventory },
            secondary: { href: hrefTo(lang, "/vehicles", ctx, { class: "county" }), label: text.classCounty },
          },
          {
            id: "sell",
            image: "/demo/medium-cover.jpg",
            imageAlt: text.navSell,
            title: text.sellTitle,
            body: text.sellBody,
            tone: "sell",
            primary: { href: hrefTo(lang, "/sell", ctx), label: text.navSell },
          },
          {
            id: "scrap",
            image: "/demo/large-cover.jpg",
            imageAlt: text.navScrap,
            title: text.scrapTitle,
            body: text.scrapBody,
            tone: "scrap",
            primary: { href: hrefTo(lang, "/scrap", ctx), label: text.navScrap },
          },
        ]}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {(
          [
            [...classes[0], "/demo/county-cover.jpg"],
            [...classes[1], "/demo/medium-cover.jpg"],
            [...classes[2], "/demo/large-cover.jpg"],
          ] as const
        ).map(([title, body, slot, href, image]) => (
          <Link key={title} href={href} className="group overflow-hidden border border-line bg-white transition hover:border-primary/40">
            <div className="relative aspect-[16/9] overflow-hidden bg-primary-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={slot} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              <span className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary to-transparent" />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-semibold text-ink transition group-hover:text-primary">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </div>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="section-title text-2xl font-semibold tracking-tight text-ink">{text.newArrivals}</h2>
        {fresh.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {fresh.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} href={cardHref(vehicle)} listedBy={site.settings.companyName} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted">{text.noVehicles}</p>
        )}
      </section>

      <section className="-mx-4 bg-primary-soft/70 px-4 py-8 md:mx-0 md:rounded-2xl md:px-6">
        <h2 className="section-title text-2xl font-semibold tracking-tight text-ink">{text.featured}</h2>
        {featured.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} href={cardHref(vehicle)} listedBy={site.settings.companyName} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted">{text.noVehicles}</p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href={hrefTo(lang, "/wanted", ctx)}
          className="border border-primary/20 bg-primary-soft/60 p-6 transition hover:border-primary/45 hover:bg-primary-soft"
        >
          <p className="text-xs font-semibold tracking-[0.14em] text-primary">{text.search}</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">{text.wantedTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{text.wantedBody}</p>
        </Link>
        <Link
          href={hrefTo(lang, "/sell", ctx)}
          className="border border-accent-warm/25 bg-accent-warm-soft/70 p-6 transition hover:border-accent-warm/45 hover:bg-accent-warm-soft"
        >
          <p className="text-xs font-semibold tracking-[0.14em] text-accent-warm">{text.navSell}</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">{text.sellTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{text.sellBody}</p>
        </Link>
      </section>

      <section className="grid gap-6 border border-line bg-white p-6 md:grid-cols-[0.8fr_1.2fr]">
        <div className="relative min-h-48 overflow-hidden border border-line bg-primary-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/demo/hero-yard.jpg" alt={text.mediaYard} className="h-full min-h-48 w-full object-cover" />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-primary">K-BUS HUB</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">{text.companyTitle}</h2>
          <p className="mt-3 text-sm leading-6">{contentFieldLang(lang) === "ko" ? site.settings.aboutKo : site.settings.aboutEn}</p>
          <div className="mt-4 text-sm text-muted">
            {site.settings.address ? <p>{site.settings.address}</p> : null}
            {site.settings.phone ? <p>{text.phone} {site.settings.phone}</p> : null}
            {site.settings.whatsappE164 ? <p>{text.whatsapp} {site.settings.phone ?? `+${site.settings.whatsappE164}`}</p> : null}
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
