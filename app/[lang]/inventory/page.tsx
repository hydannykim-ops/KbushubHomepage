import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilterForm } from "@/components/filter-form";
import { ListingCard } from "@/components/listing-card";
import { PageIntro } from "@/components/page-intro";
import { filterVehicles, parseFilterParams, textOf } from "@/lib/domain";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { publicData } from "@/lib/store";
import { chipOff, chipOn, panel } from "@/lib/ui";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDict(lang);
  return { title: dict.inventory.title, description: dict.inventory.lead };
}

export default async function InventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang: Locale = raw;
  const trade = await tradeMode();
  const data = await publicData();
  if (!data.ok) return null;
  const dict = getDict(lang);
  const query = await searchParams;
  const filters = parseFilterParams(query);
  const result = filterVehicles(data.vehicles, trade, filters);
  const makers = [...new Map(data.vehicles.filter((v) => v.status !== "hidden").map((v) => [v.manufacturerKey, textOf(v.manufacturer, lang, v.manufacturerKey)])).entries()].map(
    ([value, label]) => ({ value, label }),
  );
  const models = [...new Map(data.vehicles.filter((v) => v.status !== "hidden").map((v) => [v.modelKey, textOf(v.model, lang, v.modelKey)])).entries()].map(
    ([value, label]) => ({ value, label }),
  );
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value != null && value !== "") values[key] = String(value);
  }
  const sorts = ["newest", "yearDesc", "yearAsc", "priceAsc", "priceDesc", "mileageAsc"] as const;
  const pageQuery = (page: number) => {
    const next: Record<string, string | undefined> = { ...values, page: String(page) };
    if (page <= 1) delete next.page;
    return hrefFor(lang, "/inventory", trade, next);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <PageIntro kicker={dict.common.sample} title={dict.inventory.title} lead={dict.inventory.lead} />
      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside>
        <details open className={`${panel} p-5`}>
          <summary className="text-sm font-semibold">{dict.a11y.filters}</summary>
          <div className="mt-4">
            <FilterForm lang={lang} trade={trade} action={`/${lang}/inventory`} values={values} makers={makers} models={models} />
          </div>
        </details>
      </aside>
      <div>
        <p className="text-sm">
          <span className="font-semibold tabular-nums">{result.total}</span> {dict.inventory.count}
        </p>
        {result.priceIgnored ? <p className={`${panel} mt-3 px-4 py-3 text-sm`}>{dict.inventory.priceIgnored}</p> : null}
        <p className="mt-3 text-xs leading-5 text-muted">{dict.inventory.priceNote}</p>
        <div className="mt-4 flex flex-wrap gap-2" aria-label={dict.inventory.sort}>
          {sorts.map((sort) => (
            <Link
              key={sort}
              href={hrefFor(lang, "/inventory", trade, { ...values, sort, page: undefined })}
              aria-current={result.sort === sort ? "true" : undefined}
              className={result.sort === sort ? chipOn : chipOff}
            >
              {dict.inventory[sort]}
            </Link>
          ))}
        </div>
        {result.items.length ? (
          <div className="mt-6 grid gap-4">
            {result.items.map((vehicle) => (
              <ListingCard key={vehicle.id} vehicle={vehicle} lang={lang} trade={trade} />
            ))}
          </div>
        ) : (
          <div className={`${panel} mt-6 p-8`}>
            <h2 className="text-lg font-semibold">{dict.inventory.empty}</h2>
            <p className="mt-2 text-sm text-muted">{dict.inventory.emptyBody}</p>
            <Link href={hrefFor(lang, "/request", trade)} className="mt-4 inline-flex text-sm font-semibold text-blue">
              {dict.home.requestCta}
            </Link>
          </div>
        )}
        {result.pages > 1 ? (
          <nav aria-label={dict.inventory.page} className="mt-6 flex gap-2">
            {result.page > 1 ? <Link className={chipOff} href={pageQuery(result.page - 1)}>{dict.inventory.prev}</Link> : null}
            <span className="px-3 py-2 text-sm tabular-nums">{result.page} / {result.pages}</span>
            {result.page < result.pages ? <Link className={chipOff} href={pageQuery(result.page + 1)}>{dict.inventory.next}</Link> : null}
          </nav>
        ) : null}
      </div>
      </div>
    </div>
  );
}
