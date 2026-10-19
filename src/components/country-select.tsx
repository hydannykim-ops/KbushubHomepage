import { countries, countryLabel } from "@/lib/domain/countries";
import type { Lang } from "@/lib/domain/types";

export function CountrySelect({
  lang,
  name = "country",
  label,
  required = false,
  defaultValue = "",
  className = "rounded-md border border-line px-3 py-2 font-normal",
}: {
  lang: Lang;
  name?: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      <select name={name} required={required} defaultValue={defaultValue} className={className}>
        <option value="">{lang === "ko" ? "국가 선택" : "Select a country"}</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {countryLabel(country.code, lang)}
          </option>
        ))}
      </select>
    </label>
  );
}
