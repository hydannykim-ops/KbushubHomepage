import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function DataProblem({
  lang,
  reason,
}: {
  lang: Locale;
  reason: "live_not_connected" | "read_failed";
}) {
  const dict = getDict(lang);
  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <h1 className="text-2xl font-semibold">{reason === "live_not_connected" ? dict.errors.live : dict.errors.save}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{dict.common.dataProblem}</p>
    </div>
  );
}
