import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandSidebar } from "@/components/brand-sidebar";
import { DataProblem, VehicleCard, sortHref } from "@/components/catalog";
import { MarketFilterBar } from "@/components/market-filters";
import { copy } from "@/lib/i18n";
import { parseVehicleQuery } from "@/lib/domain/filters";
import { KRW_PER_USD } from "@/lib/domain/money";
import type { Lang, VehicleQuery } from "@/lib/domain/types";
import { makerLabel, makersForClass, modelLabel, seriesForModel, seriesLabel } from "@/lib/domain/vehicle-catalog";
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
  const listedQuery = priceQueryForLang(query, lang);
  const text = copy(lang);
  const site = await loadSite();
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;

  const selectedClass = (query.vehicleClass || "") as VehicleClass | "";
  let result;
  let countSource;
  try {
    result = await site.repo.listPublic(listedQuery, ctx.mode);
    countSource = await site.repo.listPublic(
      {
        vehicleClass: selectedClass,
        yearMin: query.yearMin,
        yearMax: query.yearMax,
        priceMin: listedQuery.priceMin,
        priceMax: listedQuery.priceMax,
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

        <div className="min-w-0 px-4 py-5 md:px-6 md:py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">{text.navVehicles}</h1>
          </div>

          <div className="mb-5">
            <MarketFilterBar lang={lang} ctx={ctx} query={query} />
          </div>

          {result.ignoredPriceFilter ? (
            <p className="mb-4 text-sm text-muted" role="status">
              {text.priceIgnored}
            </p>
          ) : null}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-bold tabular-nums text-ink">{text.resultCount.replace("{n}", String(result.items.length))}</p>
            <div className="flex flex-wrap gap-1 text-sm">
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
              {query.maker ? <span className="text-muted">{makerLabel(query.maker, lang)}</span> : null}
              {query.model ? <span className="text-muted">{seriesLabel(seriesForModel(query.model), lang)}</span> : null}
              {query.model && seriesForModel(query.model) !== query.model ? (
                <span className="text-muted">{modelLabel(query.model, lang)}</span>
              ) : null}
              <Link href={hrefTo(lang, "/vehicles", ctx)} className="font-medium text-muted hover:text-ink">
                {text.reset}
              </Link>
            </div>
          )}

          {result.items.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
              {result.items.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  lang={lang}
                  href={hrefTo(lang, `/vehicles/${vehicle.stockNo}`, ctx)}
                  listedBy={site.settings.companyName}
                />
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

/** Overseas price boxes are USD. Compare them against the same won price the card converts from. */
function priceQueryForLang(query: VehicleQuery, lang: Lang): VehicleQuery {
  if (lang === "ko") return query;
  return {
    ...query,
    priceMin: query.priceMin != null ? query.priceMin * KRW_PER_USD : null,
    priceMax: query.priceMax != null ? query.priceMax * KRW_PER_USD : null,
  };
}
