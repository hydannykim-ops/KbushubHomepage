import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandSidebar } from "@/components/brand-sidebar";
import { DataProblem, VehicleCard, sortHref } from "@/components/catalog";
import { MarketFilterBar } from "@/components/market-filters";
import { copy } from "@/lib/i18n";
import { parseVehicleQuery } from "@/lib/domain/filters";
import { makersForClass } from "@/lib/domain/vehicle-catalog";
import type { VehicleClass } from "@/lib/domain/types";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

export default async function VehiclesPage({
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
  const query = parseVehicleQuery(sp);
  const text = copy(lang);
  const site = await loadSite();
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;

  const selectedClass = (query.vehicleClass || "") as VehicleClass | "";
  let result;
  let countSource;
  try {
    result = await site.repo.listPublic(query, ctx.mode);
    countSource = await site.repo.listPublic(
      {
        vehicleClass: selectedClass,
        yearMin: query.yearMin,
        yearMax: query.yearMax,
        priceMin: query.priceMin,
        priceMax: query.priceMax,
        priceCurrency: query.priceCurrency,
        seatsMin: query.seatsMin,
        mileageMax: query.mileageMax,
        transmission: query.transmission,
        fuel: query.fuel,
        status: query.status,
        sort: "newest",
      },
      ctx.mode,
    );
  } catch {
    return <DataProblem lang={lang} code="upstream" />;
  }

  const counts: Record<string, number> = {};
  for (const maker of makersForClass(selectedClass)) counts[maker] = 0;
  for (const vehicle of countSource.items) {
    counts[vehicle.maker] = (counts[vehicle.maker] ?? 0) + 1;
  }

  return (
    <div className="border-t border-line bg-[#f6f7f9]">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <BrandSidebar lang={lang} ctx={ctx} query={query} counts={counts} />

        <div className="min-w-0 px-4 py-5 md:px-6 md:py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">{text.navVehicles}</h1>
          </div>

          <div className="mb-4 overflow-x-auto pb-1">
            <MarketFilterBar lang={lang} ctx={ctx} query={query} />
          </div>

          {result.ignoredPriceFilter ? (
            <p className="mb-4 bg-white px-4 py-3 text-sm text-muted" role="status">
              {text.priceIgnored}
            </p>
          ) : null}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-bold tabular-nums text-ink">{text.resultCount.replace("{n}", String(result.items.length))}</p>
            <div className="flex gap-1 overflow-x-auto text-sm">
              {(["newest", "year_desc", "year_asc", "price_asc", "price_desc", "mileage_asc"] as const).map((sort) => {
                const active = query.sort === sort || (!query.sort && sort === "newest");
                return (
                  <Link
                    key={sort}
                    href={sortHref(`/${lang}/vehicles`, query, sort, ctx)}
                    className={["shrink-0 px-2.5 py-1.5 font-medium", active ? "text-ink" : "text-muted hover:text-ink"].join(" ")}
                    aria-current={active ? "true" : undefined}
                  >
                    {text.sorts[sort]}
                  </Link>
                );
              })}
            </div>
          </div>

          {(query.maker || query.model || selectedClass) && (
            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              {selectedClass ? (
                <span className="rounded-full bg-white px-3 py-1 text-muted ring-1 ring-line">
                  {selectedClass === "county" ? text.classCounty : selectedClass === "medium" ? text.classMedium : text.classLarge}
                </span>
              ) : null}
              {query.maker ? <span className="rounded-full bg-white px-3 py-1 text-muted ring-1 ring-line">{query.maker}</span> : null}
              {query.model ? <span className="rounded-full bg-white px-3 py-1 text-muted ring-1 ring-line">{query.model}</span> : null}
              <Link href={hrefTo(lang, "/vehicles", ctx)} className="px-2 py-1 font-medium text-muted hover:text-ink">
                {text.reset}
              </Link>
            </div>
          )}

          {result.items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} mode={ctx.mode} href={hrefTo(lang, `/vehicles/${vehicle.stockNo}`, ctx)} />
              ))}
            </div>
          ) : (
            <p className="bg-white px-6 py-16 text-center text-muted">{text.noResults}</p>
          )}
        </div>
      </div>
    </div>
  );
}
