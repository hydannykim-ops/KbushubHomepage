import Link from "next/link";
import { notFound } from "next/navigation";
import { DataProblem, VehicleCard, sortHref } from "@/components/catalog";
import { MakerModelPicker } from "@/components/maker-model-picker";
import { copy } from "@/lib/i18n";
import { parseVehicleQuery } from "@/lib/domain/filters";
import type { VehicleClass } from "@/lib/domain/types";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";
import { fuelLabel, statusLabel, transmissionLabel } from "@/lib/labels";

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
  let result;
  try {
    result = await site.repo.listPublic(query, ctx.mode);
  } catch {
    return <DataProblem lang={lang} code="upstream" />;
  }

  const selectedClass = (query.vehicleClass || "") as VehicleClass | "";
  const classOptions: Array<{ value: VehicleClass | ""; label: string }> = [
    { value: "", label: text.all },
    { value: "county", label: text.classCounty },
    { value: "medium", label: text.classMedium },
    { value: "large", label: text.classLarge },
  ];
  const detailOpen = Boolean(
    query.q ||
      query.yearMin != null ||
      query.yearMax != null ||
      query.priceMin != null ||
      query.priceMax != null ||
      query.priceCurrency ||
      query.seatsMin != null ||
      query.mileageMax != null ||
      query.transmission ||
      query.fuel ||
      query.status,
  );
  const field =
    "w-full border-0 border-b border-line bg-transparent px-0 py-2.5 text-sm font-normal outline-none focus:border-ink";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">{text.navVehicles}</h1>
          <p className="mt-2 text-sm text-muted">{text.classFilterHint}</p>
        </div>
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-line" aria-label={text.classLabel}>
        {classOptions.map((option) => {
          const active = selectedClass === option.value;
          return (
            <Link
              key={option.value || "all"}
              href={hrefTo(lang, "/vehicles", ctx, option.value ? { class: option.value } : {})}
              className={[
                "shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
                active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              {option.label}
            </Link>
          );
        })}
      </nav>

      <form action={`/${lang}/vehicles`} method="get" className="mt-6">
        <input type="hidden" name="mode" value={ctx.mode} />
        {ctx.ref ? <input type="hidden" name="ref" value={ctx.ref} /> : null}
        <input type="hidden" name="class" value={selectedClass} />

        <section className="bg-white px-4 py-5 md:px-6 md:py-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">{text.brandModel}</h2>
            {(query.maker || query.model) && (
              <Link href={hrefTo(lang, "/vehicles", ctx, selectedClass ? { class: selectedClass } : {})} className="text-sm font-medium text-muted hover:text-ink">
                {text.reset}
              </Link>
            )}
          </div>
          <MakerModelPicker
            key={selectedClass || "all"}
            lang={lang}
            allowEmpty
            layout="market"
            vehicleClass={selectedClass}
            defaultMaker={query.maker ?? ""}
            defaultModel={query.model ?? ""}
          />
        </section>

        <details className="mt-3 bg-white open:pb-2" open={detailOpen || undefined}>
          <summary className="cursor-pointer list-none px-4 py-4 text-sm font-semibold text-ink md:px-6 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              <span>{text.moreFilters}</span>
              <span className="text-xs font-medium text-muted" aria-hidden>
                ▾
              </span>
            </span>
          </summary>
          <div className="grid gap-5 border-t border-line px-4 py-5 md:grid-cols-3 md:px-6 lg:grid-cols-4">
            <label className="grid gap-1 text-xs font-semibold tracking-wide text-muted">
              {text.keyword}
              <input name="q" defaultValue={query.q ?? ""} className={field} />
            </label>
            <label className="grid gap-1 text-xs font-semibold tracking-wide text-muted">
              {text.year} {text.from}
              <input name="yearMin" inputMode="numeric" defaultValue={query.yearMin ?? ""} className={field} />
            </label>
            <label className="grid gap-1 text-xs font-semibold tracking-wide text-muted">
              {text.year} {text.to}
              <input name="yearMax" inputMode="numeric" defaultValue={query.yearMax ?? ""} className={field} />
            </label>
            <label className="grid gap-1 text-xs font-semibold tracking-wide text-muted">
              {text.price} {text.from}
              <input name="priceMin" inputMode="numeric" defaultValue={query.priceMin ?? ""} className={field} />
            </label>
            <label className="grid gap-1 text-xs font-semibold tracking-wide text-muted">
              {text.price} {text.to}
              <input name="priceMax" inputMode="numeric" defaultValue={query.priceMax ?? ""} className={field} />
            </label>
            {ctx.mode === "export" ? (
              <label className="grid gap-1 text-xs font-semibold tracking-wide text-muted">
                {text.currency}
                <select name="priceCurrency" defaultValue={query.priceCurrency ?? ""} className={field}>
                  <option value="">{text.all}</option>
                  {["USD", "EUR", "KRW", "JPY", "CNY", "AED"].map((currency) => (
                    <option key={currency}>{currency}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="grid gap-1 text-xs font-semibold tracking-wide text-muted">
              {text.seats} {text.from}
              <input name="seatsMin" inputMode="numeric" defaultValue={query.seatsMin ?? ""} className={field} />
            </label>
            <label className="grid gap-1 text-xs font-semibold tracking-wide text-muted">
              {text.mileage} {text.to}
              <input name="mileageMax" inputMode="numeric" defaultValue={query.mileageMax ?? ""} className={field} />
            </label>
            <label className="grid gap-1 text-xs font-semibold tracking-wide text-muted">
              {text.transmission}
              <select name="transmission" defaultValue={query.transmission ?? ""} className={field}>
                <option value="">{text.all}</option>
                <option value="automatic">{transmissionLabel("automatic", lang)}</option>
                <option value="manual">{transmissionLabel("manual", lang)}</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold tracking-wide text-muted">
              {text.fuel}
              <select name="fuel" defaultValue={query.fuel ?? ""} className={field}>
                <option value="">{text.all}</option>
                {["diesel", "gasoline", "lpg", "cng", "electric", "hybrid"].map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuelLabel(fuel as "diesel", lang)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold tracking-wide text-muted">
              {text.status}
              <select name="status" defaultValue={query.status ?? ""} className={field}>
                <option value="">{text.all}</option>
                {(["available", "reserved", "sold"] as const).map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status, lang)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="submit" className="bg-ink px-5 py-3 text-sm font-semibold text-white">
            {text.applyFilters}
          </button>
          <Link href={hrefTo(lang, "/vehicles", ctx, selectedClass ? { class: selectedClass } : {})} className="px-2 py-3 text-sm font-medium text-muted hover:text-ink">
            {text.reset}
          </Link>
        </div>
      </form>

      {result.ignoredPriceFilter ? (
        <p className="mt-4 bg-white px-4 py-3 text-sm text-muted" role="status">
          {text.priceIgnored}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <p className="text-lg font-bold tabular-nums text-ink">{text.resultCount.replace("{n}", String(result.items.length))}</p>
        <div className="flex gap-1 overflow-x-auto text-sm">
          {(["newest", "year_desc", "year_asc", "price_asc", "price_desc", "mileage_asc"] as const).map((sort) => {
            const active = query.sort === sort || (!query.sort && sort === "newest");
            return (
              <Link
                key={sort}
                href={sortHref(`/${lang}/vehicles`, query, sort, ctx)}
                className={["shrink-0 px-3 py-1.5 font-medium", active ? "text-ink" : "text-muted hover:text-ink"].join(" ")}
                aria-current={active ? "true" : undefined}
              >
                {text.sorts[sort]}
              </Link>
            );
          })}
        </div>
      </div>

      {result.items.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {result.items.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} mode={ctx.mode} href={hrefTo(lang, `/vehicles/${vehicle.stockNo}`, ctx)} />
          ))}
        </div>
      ) : (
        <p className="mt-10 bg-white px-6 py-16 text-center text-muted">{text.noResults}</p>
      )}
    </div>
  );
}
