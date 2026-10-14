import Link from "next/link";
import { notFound } from "next/navigation";
import { DataProblem, VehicleCard, sortHref } from "@/components/catalog";
import { copy } from "@/lib/i18n";
import { parseVehicleQuery } from "@/lib/domain/filters";
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
  const all = await site.repo.listPublic({}, ctx.mode);
  const makers = [...new Set(all.items.map((vehicle) => vehicle.maker))];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">{text.navVehicles}</h1>
        <p className="mt-2 text-sm text-muted">{text.priceNote}</p>
      </div>
      <form action={`/${lang}/vehicles`} method="get" className="grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-4">
        <input type="hidden" name="mode" value={ctx.mode} />
        {ctx.ref ? <input type="hidden" name="ref" value={ctx.ref} /> : null}
        <label className="grid gap-1 text-sm font-medium">
          {text.keyword}
          <input name="q" defaultValue={query.q ?? ""} className="rounded-md border border-line px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {text.maker}
          <input name="maker" list="makers" defaultValue={query.maker ?? ""} className="rounded-md border border-line px-3 py-2 font-normal" />
          <datalist id="makers">
            {makers.map((maker) => (
              <option key={maker} value={maker} />
            ))}
          </datalist>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {text.model}
          <input name="model" defaultValue={query.model ?? ""} className="rounded-md border border-line px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {text.classLabel}
          <select name="class" defaultValue={query.vehicleClass ?? ""} className="rounded-md border border-line px-3 py-2 font-normal">
            <option value="">{text.all}</option>
            <option value="county">{text.classCounty}</option>
            <option value="medium">{text.classMedium}</option>
            <option value="large">{text.classLarge}</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {text.year} {text.from}
          <input name="yearMin" inputMode="numeric" defaultValue={query.yearMin ?? ""} className="rounded-md border border-line px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {text.year} {text.to}
          <input name="yearMax" inputMode="numeric" defaultValue={query.yearMax ?? ""} className="rounded-md border border-line px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {text.price} {text.from}
          <input name="priceMin" inputMode="numeric" defaultValue={query.priceMin ?? ""} className="rounded-md border border-line px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {text.price} {text.to}
          <input name="priceMax" inputMode="numeric" defaultValue={query.priceMax ?? ""} className="rounded-md border border-line px-3 py-2 font-normal" />
        </label>
        {ctx.mode === "export" ? (
          <label className="grid gap-1 text-sm font-medium">
            {text.currency}
            <select name="priceCurrency" defaultValue={query.priceCurrency ?? ""} className="rounded-md border border-line px-3 py-2 font-normal">
              <option value="">{text.all}</option>
              {["USD", "EUR", "KRW", "JPY", "CNY", "AED"].map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="grid gap-1 text-sm font-medium">
          {text.seats} {text.from}
          <input name="seatsMin" inputMode="numeric" defaultValue={query.seatsMin ?? ""} className="rounded-md border border-line px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {text.mileage} {text.to}
          <input name="mileageMax" inputMode="numeric" defaultValue={query.mileageMax ?? ""} className="rounded-md border border-line px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {text.transmission}
          <select name="transmission" defaultValue={query.transmission ?? ""} className="rounded-md border border-line px-3 py-2 font-normal">
            <option value="">{text.all}</option>
            <option value="automatic">{transmissionLabel("automatic", lang)}</option>
            <option value="manual">{transmissionLabel("manual", lang)}</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {text.fuel}
          <select name="fuel" defaultValue={query.fuel ?? ""} className="rounded-md border border-line px-3 py-2 font-normal">
            <option value="">{text.all}</option>
            {["diesel", "gasoline", "lpg", "cng", "electric", "hybrid"].map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuelLabel(fuel as "diesel", lang)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {text.status}
          <select name="status" defaultValue={query.status ?? ""} className="rounded-md border border-line px-3 py-2 font-normal">
            <option value="">{text.all}</option>
            {(["available", "reserved", "sold"] as const).map((status) => (
              <option key={status} value={status}>
                {statusLabel(status, lang)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">{text.applyFilters}</button>
          <Link href={hrefTo(lang, "/vehicles", ctx)} className="rounded-md border border-line px-4 py-2 text-sm">
            {text.reset}
          </Link>
        </div>
      </form>
      {result.ignoredPriceFilter ? (
        <p className="rounded-md border border-line bg-white px-3 py-2 text-sm" role="status">
          {text.priceIgnored}
        </p>
      ) : null}
      <div className="flex gap-2 overflow-x-auto text-sm">
        {(["newest", "year_desc", "year_asc", "price_asc", "price_desc", "mileage_asc"] as const).map((sort) => (
          <Link
            key={sort}
            href={sortHref(`/${lang}/vehicles`, query, sort, ctx)}
            className={`shrink-0 rounded-full border px-3 py-1 ${query.sort === sort || (!query.sort && sort === "newest") ? "border-primary bg-primary text-white" : "border-line bg-white"}`}
            aria-current={query.sort === sort ? "true" : undefined}
          >
            {text.sorts[sort]}
          </Link>
        ))}
      </div>
      {result.items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} lang={lang} mode={ctx.mode} href={hrefTo(lang, `/vehicles/${vehicle.stockNo}`, ctx)} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-line bg-white p-8 text-center text-muted">{text.noResults}</p>
      )}
    </div>
  );
}
