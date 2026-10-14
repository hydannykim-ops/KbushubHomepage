import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { countByClass, textOf } from "@/lib/domain";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { publicData } from "@/lib/store";
import { btnPrimary, btnSecondary, eyebrow, fieldClass, panel } from "@/lib/ui";
import type { Locale, VehicleClass } from "@/lib/types";

const classPhotos: Record<VehicleClass, string> = {
  county: "/stock/samples/class-county.jpg",
  medium: "/stock/samples/class-medium.jpg",
  large: "/stock/samples/class-large.jpg",
};

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
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-10 lg:px-8 lg:pt-16">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className={eyebrow}>{dict.home.eyebrow}</p>
            <h1 className="mt-4 max-w-xl whitespace-pre-line text-[2.65rem] font-semibold leading-[1.05] tracking-[-0.04em] text-ink md:text-6xl">
              {dict.home.title}
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-muted">{dict.home.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className={btnPrimary} href={hrefFor(lang, "/inventory", trade)}>{dict.nav.inventory}</Link>
              <Link className={btnSecondary} href={hrefFor(lang, "/guide", trade)}>{dict.nav.guide}</Link>
            </div>
          </div>
          <div className="relative min-h-64 overflow-hidden rounded-[1.5rem] lg:col-span-6">
            <Image
              src="/stock/samples/home-hero.jpg"
              alt={lang === "ko" ? "참고 사진 · 메인 비주얼" : "Reference photo · Main visual"}
              width={1600}
              height={1200}
              priority
              className="aspect-[4/3] h-full w-full object-cover md:aspect-[5/4]"
            />
            <p className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-muted">
              {dict.common.slotHero}
            </p>
          </div>
        </div>
        <form action={`/${lang}/inventory`} method="get" className={`${panel} mt-8 grid gap-3 p-4 md:grid-cols-4 md:items-end md:p-5`}>
          <input type="hidden" name="trade" value={trade} />
          <label className="grid gap-1.5 text-[12px] font-medium text-muted">
            {dict.home.maker}
            <select name="maker" className={fieldClass} defaultValue="">
              <option value="">{dict.common.all}</option>
              {makers.map(([key, label]) => (
                <option key={key} value={key}>{textOf(label, lang, key)}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-[12px] font-medium text-muted">
            {dict.home.klass}
            <select name="class" className={fieldClass} defaultValue="">
              <option value="">{dict.common.all}</option>
              <option value="county">{dict.klass.county}</option>
              <option value="medium">{dict.klass.medium}</option>
              <option value="large">{dict.klass.large}</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-[12px] font-medium text-muted">
            {dict.home.keyword}
            <input name="q" className={fieldClass} />
          </label>
          <button className={btnPrimary}>{dict.home.submit}</button>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-[-0.03em]">{dict.home.classes}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {classes.map((item, index) => (
            <Link key={item.key} href={hrefFor(lang, "/inventory", trade, { class: item.key })} className={`${panel} overflow-hidden`}>
              <div className="relative aspect-[4/3] bg-sand">
                <Image
                  src={classPhotos[item.key]}
                  alt={`${dict.klass[item.key]} · ${lang === "ko" ? "참고 사진" : "Reference photo"}`}
                  width={1200}
                  height={900}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <p className="font-mono text-[11px] tracking-[0.16em] text-muted">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{dict.klass[item.key]}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
                <p className="mt-5 text-sm">
                  <span className="font-semibold tabular-nums">{countByClass(visible, item.key)}</span>
                  <span className="text-muted"> {dict.home.available}{dict.home.units ? ` ${dict.home.units}` : ""} · {dict.home.demoCount}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-[-0.03em]">{dict.home.newest}</h2>
          <Link href={hrefFor(lang, "/inventory", trade)} className="text-sm font-semibold text-blue">{dict.home.viewAll}</Link>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {newest.map((vehicle) => (
            <ListingCard key={vehicle.id} vehicle={vehicle} lang={lang} trade={trade} layout="grid" />
          ))}
        </div>
      </section>

      {featured.length ? (
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-[-0.03em]">{dict.home.featured}</h2>
          <div className="mt-8 grid gap-5">
            <ListingCard vehicle={featured[0]} lang={lang} trade={trade} layout="feature" />
            {featured.length > 1 ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {featured.slice(1).map((vehicle) => (
                  <ListingCard key={vehicle.id} vehicle={vehicle} lang={lang} trade={trade} layout="grid" />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-[-0.03em]">{dict.home.process}</h2>
        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          {[{ title: dict.home.domestic, steps: dict.home.domesticSteps }, { title: dict.home.export, steps: dict.home.exportSteps }].map((group) => (
            <div key={group.title}>
              <h3 className="text-xl font-semibold tracking-[-0.02em]">{group.title}</h3>
              <ol className="mt-6 border-l border-line">
                {group.steps.map((step, index) => (
                  <li key={step.title} className="py-4 pl-6">
                    <p className="font-mono text-[11px] tracking-[0.16em] text-blue">{String(index + 1).padStart(2, "0")}</p>
                    <p className="mt-1 font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">{dict.home.requestTitle}</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/70">{dict.home.requestBody}</p>
            <Link href={hrefFor(lang, "/request", trade)} className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-5 text-sm font-semibold text-ink">
              {dict.home.requestCta}
            </Link>
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">{dict.home.partnerTitle}</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/70">{dict.home.partnerBody}</p>
            <Link href={hrefFor(lang, "/partners", trade)} className="mt-8 inline-flex h-12 items-center rounded-full bg-white/10 px-5 text-sm font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]">
              {dict.home.partnerCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-[-0.03em]">{dict.home.company}</h2>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[12px] tracking-wide text-muted">{dict.detail.location}</dt>
            <dd className="mt-2 text-lg">{address || dict.common.unset}</dd>
          </div>
          <div>
            <dt className="text-[12px] tracking-wide text-muted">{dict.detail.phone}</dt>
            <dd className="mt-2 text-lg">{settings.phone || dict.common.unset}</dd>
          </div>
          <div>
            <dt className="text-[12px] tracking-wide text-muted">Email</dt>
            <dd className="mt-2 text-lg">{settings.email || dict.common.unset}</dd>
          </div>
          <div>
            <dt className="text-[12px] tracking-wide text-muted">Hours</dt>
            <dd className="mt-2 text-lg">{hours || dict.common.unset}</dd>
          </div>
        </dl>
        {!settings.phone && !settings.email && !address ? (
          <p className="mt-6 text-sm text-muted">{dict.home.companyEmpty}</p>
        ) : null}
      </section>
    </>
  );
}
