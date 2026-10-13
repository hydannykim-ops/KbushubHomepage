import Link from "next/link";
import { BusArt } from "@/components/bus-art";
import { ListingCard } from "@/components/listing-card";
import { countByClass, textOf } from "@/lib/domain";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { publicData } from "@/lib/store";
import { btnPrimary, btnSecondary, fieldClass } from "@/lib/ui";
import type { Locale, VehicleClass } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang: Locale = raw;
  const trade = await tradeMode();
  const data = await publicData();
  if (!data.ok) return null;
  const dict = getDict(lang);
  const visible = data.vehicles.filter((vehicle) => vehicle.status !== "hidden");
  const makers = [...new Map(visible.map((vehicle) => [vehicle.manufacturerKey, vehicle.manufacturer])).entries()];
  const featured = visible.filter((vehicle) => vehicle.featured && vehicle.status !== "sold").slice(0, 3);
  const newest = [...visible].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);
  const classes: { key: VehicleClass; body: string }[] = [
    { key: "county", body: dict.home.countyBody },
    { key: "medium", body: dict.home.mediumBody },
    { key: "large", body: dict.home.largeBody },
  ];
  const settings = data.settings;
  const address = lang === "ko" ? settings.addressKo : settings.addressEn;
  const hours = lang === "ko" ? settings.hoursKo : settings.hoursEn;

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 py-12 md:grid-cols-12 md:py-16">
          <div className="md:col-span-7">
            <p className="text-sm font-semibold text-blue">{dict.home.eyebrow}</p>
            <h1 className="mt-3 whitespace-pre-line text-4xl font-semibold tracking-tight text-ink md:text-5xl md:leading-[1.15]">
              {dict.home.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted">{dict.home.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className={btnPrimary} href={hrefFor(lang, "/inventory", trade)}>{dict.nav.inventory}</Link>
              <Link className={btnSecondary} href={hrefFor(lang, "/guide", trade)}>{dict.nav.guide}</Link>
            </div>
          </div>
          <form action={`/${lang}/inventory`} method="get" className="border border-line bg-paper p-5 md:col-span-5">
            <p className="font-mono text-xs text-blue">01</p>
            <h2 className="mt-2 text-lg font-semibold">{dict.home.search}</h2>
            <input type="hidden" name="trade" value={trade} />
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1.5 text-sm font-medium">
                {dict.home.maker}
                <select name="maker" className={fieldClass} defaultValue="">
                  <option value="">{dict.common.all}</option>
                  {makers.map(([key, label]) => (
                    <option key={key} value={key}>{textOf(label, lang, key)}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                {dict.home.klass}
                <select name="class" className={fieldClass} defaultValue="">
                  <option value="">{dict.common.all}</option>
                  <option value="county">{dict.klass.county}</option>
                  <option value="medium">{dict.klass.medium}</option>
                  <option value="large">{dict.klass.large}</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                {dict.home.keyword}
                <input name="q" className={fieldClass} />
              </label>
              <button className={btnPrimary}>{dict.home.submit}</button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-2xl font-semibold tracking-tight">{dict.home.classes}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {classes.map((item) => (
            <Link key={item.key} href={hrefFor(lang, "/inventory", trade, { class: item.key })} className="border border-line bg-white">
              <BusArt variant={item.key} label={dict.klass[item.key]} />
              <div className="border-t border-line p-5">
                <h3 className="text-lg font-semibold">{dict.klass[item.key]}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
                <p className="mt-4 text-sm">
                  <span className="font-semibold tabular-nums">{countByClass(visible, item.key)}</span>
                  <span className="text-muted"> {dict.home.available}{dict.home.units ? ` ${dict.home.units}` : ""} · {dict.home.demoCount}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">{dict.home.newest}</h2>
          <Link href={hrefFor(lang, "/inventory", trade)} className="text-sm font-semibold text-blue">{dict.home.viewAll}</Link>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {newest.map((vehicle) => (
            <ListingCard key={vehicle.id} vehicle={vehicle} lang={lang} trade={trade} layout="grid" />
          ))}
        </div>
      </section>

      {featured.length ? (
        <section className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">{dict.home.featured}</h2>
          <div className="mt-6 grid gap-4">
            {featured.map((vehicle) => (
              <ListingCard key={vehicle.id} vehicle={vehicle} lang={lang} trade={trade} layout="row" />
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">{dict.home.process}</h2>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            {[{ title: dict.home.domestic, steps: dict.home.domesticSteps }, { title: dict.home.export, steps: dict.home.exportSteps }].map((group) => (
              <div key={group.title}>
                <h3 className="text-lg font-semibold">{group.title}</h3>
                <ol className="mt-4 grid gap-3">
                  {group.steps.map((step, index) => (
                    <li key={step.title} className="border border-line p-4">
                      <p className="font-mono text-xs text-blue">{String(index + 1).padStart(2, "0")}</p>
                      <p className="mt-2 font-semibold">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted">{step.body}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-14 md:grid-cols-2">
        <div className="border border-line bg-white p-6">
          <h2 className="text-xl font-semibold">{dict.home.requestTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{dict.home.requestBody}</p>
          <Link href={hrefFor(lang, "/request", trade)} className={`${btnPrimary} mt-6`}>{dict.home.requestCta}</Link>
        </div>
        <div className="bg-ink p-6 text-white">
          <h2 className="text-xl font-semibold">{dict.home.partnerTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-white/80">{dict.home.partnerBody}</p>
          <Link href={hrefFor(lang, "/partners", trade)} className="mt-6 inline-flex h-11 items-center bg-white px-4 text-sm font-semibold text-ink">
            {dict.home.partnerCta}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">{dict.home.company}</h2>
        <dl className="mt-6 grid gap-4 border border-line bg-white p-6 sm:grid-cols-2">
          <div><dt className="text-xs text-muted">{dict.detail.location}</dt><dd className="mt-1">{address || dict.common.unset}</dd></div>
          <div><dt className="text-xs text-muted">{dict.detail.phone}</dt><dd className="mt-1">{settings.phone || dict.common.unset}</dd></div>
          <div><dt className="text-xs text-muted">Email</dt><dd className="mt-1">{settings.email || dict.common.unset}</dd></div>
          <div><dt className="text-xs text-muted">Hours</dt><dd className="mt-1">{hours || dict.common.unset}</dd></div>
        </dl>
        {!settings.phone && !settings.email && !address ? (
          <p className="mt-3 text-sm text-muted">{dict.home.companyEmpty}</p>
        ) : null}
      </section>
    </>
  );
}
