"use client";

import { useState } from "react";
import type { Lang } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";

export function ExportInquiryFields({ lang }: { lang: Lang }) {
  const text = copy(lang);
  const [portUndecided, setPortUndecided] = useState(false);

  return (
    <div className="grid gap-4 rounded-md border border-line bg-[#f8fafc] p-4">
      <p className="text-sm text-muted">{text.exportQuoteNote}</p>
      <label className="grid gap-1 text-sm font-medium">
        {text.destinationCountry}
        <input name="destinationCountry" required className="rounded-md border border-line bg-white px-3 py-2 font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.destinationPort}
        <input
          name="destinationPort"
          disabled={portUndecided}
          required={!portUndecided}
          className="rounded-md border border-line bg-white px-3 py-2 font-normal disabled:bg-[#eef1f5]"
        />
        <span className="text-xs font-normal text-muted">{text.portHint}</span>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="destinationPortUndecided"
          value="true"
          checked={portUndecided}
          onChange={(event) => setPortUndecided(event.target.checked)}
        />
        {text.portUndecided}
      </label>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">{text.shippingMethod}</legend>
        <p className="text-xs text-muted">{text.shippingHint}</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="shippingMethod" value="roro" />
          {text.shippingRoro}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="shippingMethod" value="container" />
          {text.shippingContainer}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="shippingMethod" value="undecided" defaultChecked />
          {text.shippingUndecided}
        </label>
      </fieldset>
    </div>
  );
}
