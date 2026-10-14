import Link from "next/link";
import { notFound } from "next/navigation";
import { DataProblem, VehicleCard } from "@/components/catalog";
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

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-8">
      <section className="grid gap-6 rounded-lg border border-line bg-white p-5 shadow-sm md:p-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold text-primary">K-BUS HUB</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{text.heroTitle}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{text.heroBody}</p>
        </div>
        <form action={`/${lang}/vehicles`} method="get" className="grid gap-3">
          <input type="hidden" name="mode" value={ctx.mode} />
          {ctx.ref ? <input type="hidden" name="ref" value={ctx.ref} /> : null}
          <label className="grid gap-1 text-sm font-medium">
            {text.maker}
            <input name="maker" className="rounded-md border border-line px-3 py-2 font-normal" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {text.model}
            <input name="model" className="rounded-md border border-line px-3 py-2 font-normal" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {text.classLabel}
            <select name="class" className="rounded-md border border-line px-3 py-2 font-normal" defaultValue="">
              <option value="">{text.all}</option>
              <option value="county">{text.classCounty}</option>
              <option value="medium">{text.classMedium}</option>
              <option value="large">{text.classLarge}</option>
            </select>
          </label>
          <button className="rounded-md bg-primary px-4 py-3 font-semibold text-white">{text.search}</button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          [text.classCounty, text.classCountyBody, hrefTo(lang, "/vehicles", ctx, { class: "county" })],
          [text.classMedium, text.classMediumBody, hrefTo(lang, "/vehicles", ctx, { class: "medium" })],
          [text.classLarge, text.classLargeBody, hrefTo(lang, "/vehicles", ctx, { class: "large" })],
        ].map(([title, body, href]) => (
          <Link key={title} href={href} className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm text-muted">{body}</p>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold">{text.newArrivals}</h2>
        {fresh.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {fresh.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} mode={ctx.mode} href={cardHref(vehicle)} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted">{text.noVehicles}</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold">{text.featured}</h2>
        {featured.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} mode={ctx.mode} href={cardHref(vehicle)} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted">{text.noVehicles}</p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-xl font-bold">{text.domesticProcess}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
            {text.domesticSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
        <article className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-xl font-bold">{text.exportProcess}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
            {text.exportSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href={hrefTo(lang, "/wanted", ctx)} className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-xl font-bold">{text.wantedTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{text.wantedBody}</p>
        </Link>
        <Link href={hrefTo(lang, "/partner", ctx)} className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-xl font-bold">{text.partnerTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{text.partnerBody}</p>
        </Link>
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-xl font-bold">{text.companyTitle}</h2>
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
      </section>
    </div>
  );
}
