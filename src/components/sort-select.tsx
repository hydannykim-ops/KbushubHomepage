"use client";

import { useRouter } from "next/navigation";

export function SortSelect({
  label,
  value,
  options,
  hrefByValue,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  /** Precomputed href for each sort value (server → client safe). */
  hrefByValue: Record<string, string>;
}) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm text-muted sm:hidden">
      <span className="sr-only">{label}</span>
      <select
        className="max-w-[10.5rem] border border-line bg-white px-2 py-1.5 text-sm font-medium text-ink"
        value={value}
        onChange={(event) => {
          const next = hrefByValue[event.target.value];
          if (next) router.push(next);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
