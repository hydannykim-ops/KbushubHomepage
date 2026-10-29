"use client";

import { useState } from "react";
import { ExportInquiryFields } from "@/components/export-inquiry-fields";
import type { InquiryKind, Lang, TradeMode } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";

export function InquiryKindFields({
  lang,
  defaultKind = "general",
  defaultTradeMode = "domestic",
  allowExport = true,
}: {
  lang: Lang;
  defaultKind?: InquiryKind;
  defaultTradeMode?: TradeMode;
  /** When false (Korea nationality), hide export quote option. */
  allowExport?: boolean;
}) {
  const text = copy(lang);
  const initialKind =
    !allowExport && (defaultKind === "quote" || defaultTradeMode === "export") ? "purchase" : defaultKind;
  const [kind, setKind] = useState<InquiryKind>(initialKind);
  const exportLike = allowExport && (kind === "quote" || defaultTradeMode === "export");
  const tradeMode: TradeMode = exportLike ? "export" : "domestic";

  return (
    <>
      <input type="hidden" name="tradeMode" value={tradeMode} />
      <label className="grid gap-1 text-sm font-medium">
        {text.inquiry}
        <select
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as InquiryKind)}
          className="rounded-md border border-line px-3 py-2 font-normal"
        >
          <option value="general">{text.inquiry}</option>
          <option value="purchase">{text.purchase}</option>
          <option value="visit">{text.visit}</option>
          {allowExport ? <option value="quote">{text.quote}</option> : null}
          <option value="video">{text.videoRequest}</option>
        </select>
      </label>
      {exportLike ? <ExportInquiryFields lang={lang} /> : null}
    </>
  );
}
