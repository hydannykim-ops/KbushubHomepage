import Link from "next/link";
import { notFound } from "next/navigation";
import { DataProblem, VehicleCard } from "@/components/catalog";
import { MediaSlot } from "@/components/media-slot";
import { copy } from "@/lib/i18n";
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
      <section className="grid items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary">K-BUS HUB</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{text.heroTitle}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted">{text.heroBody}</p>
          <form action={`/${lang}/vehicles`} method="get" className="mt-8 grid gap-3 border border-line bg-white p-4 sm:grid-cols-2">
            <input type="hidden" name="mode" value={ctx.mode} />
            {ctx.ref ? <input type="hidden" name="ref" value={ctx.ref} /> : null}
            <label className="grid gap-1 text-sm font-medium">
              {text.maker}
              <input name="maker" className="border border-line bg-white px-3 py-2 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              {text.model}
              <input name="model" className="border border-line bg-white px-3 py-2 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-medium sm:col-span-2">
              {text.classLabel}
              <select name="class" className="border border-line bg-white px-3 py-2 font-normal" defaultValue="">
                <option value="">{text.all}</option>
                <option value="county">{text.classCounty}</option>
                <option value="medium">{text.classMedium}</option>
                <option value="large">{text.classLarge}</option>
              </select>
            </label>
            <button className="bg-primary px-4 py-3 font-semibold text-white sm:col-span-2">{text.search}</button>
          </form>
        </div>
        <div className="min-h-72 overflow-hidden border border-line bg-white lg:min-h-[28rem]">
          <MediaSlot label={text.mediaHero} hint={text.mediaHeroHint} className="min-h-72 lg:min-h-[28rem]" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {classes.map(([title, body, slot, href]) => (
          <Link key={title} href={href} className="overflow-hidden border border-line bg-white">
            <div className="aspect-[16/9]">
              <MediaSlot label={slot} />
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
        <article className="border border-line bg-white p-6">
          <h2 className="text-xl font-semibold">{text.domesticProcess}</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6">
            {text.domesticSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
        <article className="border border-line bg-white p-6">
          <h2 className="text-xl font-semibold">{text.exportProcess}</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6">
            {text.exportSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
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
        <div className="min-h-48 overflow-hidden border border-line">
          <MediaSlot label={text.mediaYard} hint={text.mediaCoverHint} />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{text.companyTitle}</h2>
          <p className="mt-3 text-sm leading-6">{lang === "ko" ? site.settings.aboutKo : site.settings.aboutEn}</p>
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
