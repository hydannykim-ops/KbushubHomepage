"use client";

import { useState } from "react";
import { countryFlag, countryFlagUrl, countryLabel } from "@/lib/domain/countries";
import type { Lang } from "@/lib/domain/types";

/** Tiny flag image (flagcdn) with emoji fallback for OTHER / load errors. */
export function CountryFlag({
  code,
  lang = "en",
  className = "inline-block h-3 w-4 shrink-0 rounded-[2px] object-cover ring-1 ring-black/10",
}: {
  code: string;
  lang?: Lang;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = countryFlagUrl(code, "16x12");
  const alt = countryLabel(code, lang);

  if (!src || failed) {
    return (
      <span className="inline-flex h-3 w-4 shrink-0 items-center justify-center text-[11px] leading-none" aria-hidden="true">
        {countryFlag(code)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- small CDN flags; avoid next/image remote config for every ISO code
    <img
      src={src}
      srcSet={`https://flagcdn.com/32x24/${code.trim().toLowerCase()}.png 2x`}
      width={16}
      height={12}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
