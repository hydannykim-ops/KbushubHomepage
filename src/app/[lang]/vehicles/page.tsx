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

function classChipClass(active: boolean) {
  return [
    "inline-flex min-h-11 items-center border px-4 py-2.5 text-sm font-semibold transition-colors",
    active ? "border-primary bg-primary text-white" : "border-line bg-white text-foreground hover:border-primary",
  ].join(" ");
}

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

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">{text.navVehicles}</h1>
        <p className="mt-2 text-sm text-muted">{text.priceNote}</p>
      </div>

      <section className="grid gap-3 border border-line bg-white p-4">
        <div>
          <p className="mb-3 text-sm font-medium">{text.classLabel}</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={text.classLabel}>
            {classOptions.map((option) => (
              <Link
                key={option.value || "all"}
                href={hrefTo(lang, "/vehicles", ctx, option.value ? { class: option.value } : {})}
                className={classChipClass(selectedClass === option.value)}
                aria-current={selectedClass === option.value ? "page" : undefined}
              >
                {option.label}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">{text.classFilterHint}</p>
        </div>
      </section>

      <form action={`/${lang}/vehicles`} method="get" className="grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-4">
        <input type="hidden" name="mode" value={ctx.mode} />
        {ctx.ref ? <input type="hidden" name="ref" value={ctx.ref} /> : null}
        <input type="hidden" name="class" value={selectedClass} />
        <div className="md:col-span-4">
          <MakerModelPicker
            key={selectedClass || "all"}
            lang={lang}
            allowEmpty
            vehicleClass={selectedClass}
            defaultMaker={query.maker ?? ""}
            defaultModel={query.model ?? ""}
          />
        </div>
        <label className="grid gap-1 text-sm font-medium">
          {text.keyword}
          <input name="q" defaultValue={query.q ?? ""} className="rounded-md border border-line px-3 py-2 font-normal" />
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
          <Link href={hrefTo(lang, "/vehicles", ctx, selectedClass ? { class: selectedClass } : {})} className="rounded-md border border-line px-4 py-2 text-sm">
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
