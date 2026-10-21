import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandSidebar } from "@/components/brand-sidebar";
import { DataProblem, VehicleCard, sortHref } from "@/components/catalog";
import { MarketFilterBar } from "@/components/market-filters";
import { SortSelect } from "@/components/sort-select";
import { copy } from "@/lib/i18n";
import { parseVehicleQuery } from "@/lib/domain/filters";
import { makersForClass, seriesForModel } from "@/lib/domain/vehicle-catalog";
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
    <div className="border-t border-[#d8dde6]/80 bg-[#f3f5f8]">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <BrandSidebar lang={lang} ctx={ctx} query={query} counts={counts} />

        <div className="min-w-0 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl md:text-3xl">{text.navVehicles}</h1>
          </div>

          <div className="mb-4 sm:mb-5">
            <MarketFilterBar lang={lang} ctx={ctx} query={query} />
          </div>

          {result.ignoredPriceFilter ? (
            <p className="mb-4 text-sm text-muted" role="status">
              {text.priceIgnored}
            </p>
          ) : null}

          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-base font-bold tabular-nums text-ink sm:text-lg">{text.resultCount.replace("{n}", String(result.items.length))}</p>
            <SortSelect
              label={text.sort}
              value={query.sort || "newest"}
              options={(["newest", "year_desc", "year_asc", "price_asc", "price_desc", "mileage_asc"] as const).map((sort) => ({
                value: sort,
                label: text.sorts[sort],
              }))}
              hrefByValue={Object.fromEntries(
                (["newest", "year_desc", "year_asc", "price_asc", "price_desc", "mileage_asc"] as const).map((sort) => [
                  sort,
                  sortHref(`/${lang}/vehicles`, query, sort, ctx),
                ]),
              )}
            />
            <div className="hidden flex-wrap gap-1 text-sm sm:flex">
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
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              {selectedClass ? (
                <span className="text-muted">
                  {selectedClass === "county" ? text.classCounty : selectedClass === "medium" ? text.classMedium : text.classLarge}
                </span>
              ) : null}
              {query.maker ? <span className="text-muted">{query.maker}</span> : null}
              {query.model ? <span className="text-muted">{seriesForModel(query.model)}</span> : null}
              {query.model && seriesForModel(query.model) !== query.model ? (
                <span className="text-muted">{query.model}</span>
              ) : null}
              <Link href={hrefTo(lang, "/vehicles", ctx)} className="font-medium text-muted hover:text-ink">
                {text.reset}
              </Link>
            </div>
          )}

          {result.items.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} mode={ctx.mode} href={hrefTo(lang, `/vehicles/${vehicle.stockNo}`, ctx)} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-muted">{text.noResults}</p>
          )}
        </div>
      </div>
    </div>
  );
}
