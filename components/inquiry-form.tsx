"use client";

import { useActionState } from "react";
import { Consent, FieldError, FormNotice, Honeypot } from "@/components/form-bits";
import { submitInquiry } from "@/lib/actions";
import { emptyForm } from "@/lib/form-state";
import { getDict } from "@/lib/i18n";
import { areaClass, btnPrimary, fieldClass } from "@/lib/ui";
import type { InquiryKind, Locale, TradeMode } from "@/lib/types";

export function InquiryForm({
  lang,
  trade,
  vehicleId,
  kinds,
  defaultKind,
}: {
  lang: Locale;
  trade: TradeMode;
  vehicleId?: string;
  kinds: InquiryKind[];
  defaultKind: InquiryKind;
}) {
  const dict = getDict(lang);
  const [state, action, pending] = useActionState(submitInquiry, emptyForm);
  if (state.saved) return <FormNotice lang={lang} state={state} />;
  return (
    <form action={action} className="relative grid gap-4">
      <FormNotice lang={lang} state={state} />
      <Honeypot />
      <input type="hidden" name="trade" value={trade} />
      {vehicleId ? <input type="hidden" name="vehicleId" value={vehicleId} /> : null}
      <div>
        <label htmlFor="kind" className="text-sm font-medium">{dict.detail.inquiry}</label>
        <select id="kind" name="kind" defaultValue={defaultKind} className={`${fieldClass} mt-1.5`}>
          {kinds.map((kind) => (
            <option key={kind} value={kind}>{dict.kind[kind]}</option>
          ))}
        </select>
        <FieldError lang={lang} code={state.errors.kind} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium">{dict.detail.name}</label>
          <input id="name" name="name" required autoComplete="name" className={`${fieldClass} mt-1.5`} />
          <FieldError lang={lang} code={state.errors.name} />
        </div>
        <div>
          <label htmlFor="contact" className="text-sm font-medium">{dict.detail.contact}</label>
          <input id="contact" name="contact" required autoComplete="email" className={`${fieldClass} mt-1.5`} />
          <FieldError lang={lang} code={state.errors.contact} />
        </div>
      </div>
      <div>
        <label htmlFor="country" className="text-sm font-medium">{dict.detail.country}</label>
        <input id="country" name="country" autoComplete="country-name" className={`${fieldClass} mt-1.5`} />
        <FieldError lang={lang} code={state.errors.country} />
      </div>
      {trade === "export" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="destinationCountry" className="text-sm font-medium">{dict.detail.destination}</label>
            <input id="destinationCountry" name="destinationCountry" className={`${fieldClass} mt-1.5`} />
            <FieldError lang={lang} code={state.errors.destinationCountry} />
          </div>
          <div>
            <label htmlFor="destinationPort" className="text-sm font-medium">{dict.detail.port}</label>
            <input id="destinationPort" name="destinationPort" className={`${fieldClass} mt-1.5`} />
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" name="portUndecided" value="yes" />
              {dict.detail.portUndecided}
            </label>
            <FieldError lang={lang} code={state.errors.destinationPort} />
          </div>
        </div>
      ) : null}
      <div>
        <label htmlFor="message" className="text-sm font-medium">{dict.detail.message}</label>
        <textarea id="message" name="message" required className={`${areaClass} mt-1.5`} />
        <FieldError lang={lang} code={state.errors.message} />
      </div>
      <Consent lang={lang} />
      <FieldError lang={lang} code={state.errors.consent} />
      <button className={btnPrimary} disabled={pending}>{dict.detail.submit}</button>
    </form>
  );
}
