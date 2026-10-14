"use client";

import { getDict } from "@/lib/i18n";
import { btnPrimary, btnSecondary, fieldClass } from "@/lib/ui";
import type { Locale, TradeMode } from "@/lib/types";

type Option = { value: string; label: string };

export function FilterForm({
  lang,
  trade,
  action,
  values,
  makers,
  models,
}: {
  lang: Locale;
  trade: TradeMode;
  action: string;
  values: Record<string, string>;
  makers: Option[];
  models: Option[];
}) {
  const dict = getDict(lang);
  const reset = `${action}?trade=${trade}`;
  return (
    <form
      action={action}
      method="get"
      className="grid gap-4"
      onChange={(event) => {
        if (event.target instanceof HTMLSelectElement) event.currentTarget.requestSubmit();
      }}
    >
      <input type="hidden" name="trade" value={trade} />
      {values.sort ? <input type="hidden" name="sort" value={values.sort} /> : null}
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.inventory.keyword}
        <input name="q" defaultValue={values.q || ""} className={fieldClass} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.inventory.maker}
        <select name="maker" defaultValue={values.maker || ""} className={fieldClass}>
          <option value="">{dict.common.all}</option>
          {makers.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.inventory.model}
        <select name="model" defaultValue={values.model || ""} className={fieldClass}>
          <option value="">{dict.common.all}</option>
          {models.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.inventory.klass}
        <select name="class" defaultValue={values.class || ""} className={fieldClass}>
          <option value="">{dict.common.all}</option>
          <option value="county">{dict.klass.county}</option>
          <option value="medium">{dict.klass.medium}</option>
          <option value="large">{dict.klass.large}</option>
        </select>
      </label>
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="col-span-2 text-sm font-medium">{dict.inventory.year}</legend>
        <input aria-label={dict.inventory.min} name="yearMin" defaultValue={values.yearMin || ""} placeholder={dict.inventory.min} inputMode="numeric" className={fieldClass} />
        <input aria-label={dict.inventory.max} name="yearMax" defaultValue={values.yearMax || ""} placeholder={dict.inventory.max} inputMode="numeric" className={fieldClass} />
      </fieldset>
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="col-span-2 text-sm font-medium">{dict.inventory.price}</legend>
        <input aria-label={dict.inventory.min} name="priceMin" defaultValue={values.priceMin || ""} placeholder={dict.inventory.min} inputMode="decimal" className={fieldClass} />
        <input aria-label={dict.inventory.max} name="priceMax" defaultValue={values.priceMax || ""} placeholder={dict.inventory.max} inputMode="decimal" className={fieldClass} />
      </fieldset>
      {trade === "export" ? (
        <label className="grid gap-1.5 text-sm font-medium">
          {dict.inventory.currency}
          <select name="currency" defaultValue={values.currency || ""} className={fieldClass}>
            <option value="">{dict.common.all}</option>
            <option>KRW</option>
            <option>USD</option>
            <option>EUR</option>
          </select>
        </label>
      ) : null}
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="col-span-2 text-sm font-medium">{dict.inventory.seats}</legend>
        <input aria-label={dict.inventory.min} name="seatsMin" defaultValue={values.seatsMin || ""} placeholder={dict.inventory.min} inputMode="numeric" className={fieldClass} />
        <input aria-label={dict.inventory.max} name="seatsMax" defaultValue={values.seatsMax || ""} placeholder={dict.inventory.max} inputMode="numeric" className={fieldClass} />
      </fieldset>
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="col-span-2 text-sm font-medium">{dict.inventory.km}</legend>
        <input aria-label={dict.inventory.min} name="kmMin" defaultValue={values.kmMin || ""} placeholder={dict.inventory.min} inputMode="numeric" className={fieldClass} />
        <input aria-label={dict.inventory.max} name="kmMax" defaultValue={values.kmMax || ""} placeholder={dict.inventory.max} inputMode="numeric" className={fieldClass} />
      </fieldset>
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.inventory.transmission}
        <select name="transmission" defaultValue={values.transmission || ""} className={fieldClass}>
          <option value="">{dict.common.all}</option>
          <option value="manual">{dict.transmission.manual}</option>
          <option value="automatic">{dict.transmission.automatic}</option>
          <option value="unknown">{dict.transmission.unknown}</option>
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.inventory.fuel}
        <select name="fuel" defaultValue={values.fuel || ""} className={fieldClass}>
          <option value="">{dict.common.all}</option>
          {(["diesel", "gasoline", "lpg", "cng", "electric", "unknown"] as const).map((fuel) => (
            <option key={fuel} value={fuel}>{dict.fuel[fuel]}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.inventory.status}
        <select name="status" defaultValue={values.status || ""} className={fieldClass}>
          <option value="">{dict.common.all}</option>
          <option value="available">{dict.status.available}</option>
          <option value="reserved">{dict.status.reserved}</option>
          <option value="sold">{dict.status.sold}</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button className={btnPrimary}>{dict.common.apply}</button>
        <a href={reset} className={btnSecondary}>{dict.common.reset}</a>
      </div>
    </form>
  );
}
