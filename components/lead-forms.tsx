"use client";

import { useActionState } from "react";
import { Consent, FieldError, FormNotice, Honeypot } from "@/components/form-bits";
import { applyAgent, submitRequest, submitSell } from "@/lib/actions";
import { emptyForm } from "@/lib/form-state";
import { getDict } from "@/lib/i18n";
import { areaClass, btnPrimary, fieldClass } from "@/lib/ui";
import type { Locale } from "@/lib/types";

export function RequestForm({ lang, model = "" }: { lang: Locale; model?: string }) {
  const dict = getDict(lang);
  const [state, action, pending] = useActionState(submitRequest, emptyForm);
  if (state.saved) return <FormNotice lang={lang} state={state} />;
  return (
    <form action={action} className="relative grid gap-4">
      <FormNotice lang={lang} state={state} />
      <Honeypot />
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.request.model}
        <input name="model" required defaultValue={model} className={fieldClass} />
        <FieldError lang={lang} code={state.errors.model} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          {dict.request.budget}
          <input name="budgetAmount" inputMode="decimal" className={fieldClass} />
          <FieldError lang={lang} code={state.errors.budgetAmount} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {dict.request.currency}
          <select name="budgetCurrency" defaultValue="KRW" className={fieldClass}>
            <option>KRW</option>
            <option>USD</option>
            <option>EUR</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-medium">{dict.request.yearFrom}<input name="yearFrom" inputMode="numeric" className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.request.yearTo}<input name="yearTo" inputMode="numeric" className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.request.seats}<input name="seats" inputMode="numeric" className={fieldClass} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">{dict.request.quantity}<input name="quantity" required defaultValue="1" inputMode="numeric" className={fieldClass} /><FieldError lang={lang} code={state.errors.quantity} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.request.country}<input name="country" required className={fieldClass} /><FieldError lang={lang} code={state.errors.country} /></label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">{dict.request.timing}<input name="timing" className={fieldClass} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">{dict.request.name}<input name="contactName" required autoComplete="name" className={fieldClass} /><FieldError lang={lang} code={state.errors.contactName} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.request.contact}<input name="contact" required className={fieldClass} /><FieldError lang={lang} code={state.errors.contact} /></label>
      </div>
      <Consent lang={lang} />
      <FieldError lang={lang} code={state.errors.consent} />
      <button className={btnPrimary} disabled={pending}>{dict.request.submit}</button>
    </form>
  );
}

export function SellForm({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const [state, action, pending] = useActionState(submitSell, emptyForm);
  if (state.saved) return <FormNotice lang={lang} state={state} />;
  return (
    <form action={action} className="relative grid gap-4">
      <FormNotice lang={lang} state={state} />
      <Honeypot />
      <label className="grid gap-1.5 text-sm font-medium">{dict.sell.model}<input name="model" required className={fieldClass} /><FieldError lang={lang} code={state.errors.model} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">{dict.sell.year}<input name="year" inputMode="numeric" className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.sell.mileage}<input name="mileageKm" inputMode="decimal" className={fieldClass} /></label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">{dict.sell.location}<input name="location" required className={fieldClass} /><FieldError lang={lang} code={state.errors.location} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">{dict.sell.price}<input name="askingAmount" inputMode="decimal" className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.sell.currency}<select name="askingCurrency" defaultValue="KRW" className={fieldClass}><option>KRW</option><option>USD</option><option>EUR</option></select></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">{dict.sell.name}<input name="contactName" required autoComplete="name" className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.sell.contact}<input name="contact" required className={fieldClass} /><FieldError lang={lang} code={state.errors.contact} /></label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">{dict.sell.note}<textarea name="note" className={areaClass} /></label>
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.sell.photos}
        <input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="text-sm" />
        <span className="text-xs font-normal text-muted">{dict.sell.photosHint}</span>
        <FieldError lang={lang} code={state.errors.photos} />
      </label>
      <Consent lang={lang} />
      <button className={btnPrimary} disabled={pending}>{dict.sell.submit}</button>
    </form>
  );
}

export function AgentForm({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const [state, action, pending] = useActionState(applyAgent, emptyForm);
  if (state.saved) return <FormNotice lang={lang} state={state} />;
  return (
    <form action={action} className="relative grid gap-4">
      <FormNotice lang={lang} state={state} />
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">{dict.partners.name}<input name="name" required autoComplete="name" className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.partners.company}<input name="company" required className={fieldClass} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">{dict.partners.email}<input name="email" type="email" required autoComplete="email" className={fieldClass} /><FieldError lang={lang} code={state.errors.email} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.partners.phone}<input name="phone" required className={fieldClass} /></label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">{dict.partners.country}<input name="country" required className={fieldClass} /></label>
      <label className="grid gap-1.5 text-sm font-medium">{dict.partners.note}<textarea name="note" className={areaClass} /></label>
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.partners.password}
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={fieldClass} />
        <span className="text-xs font-normal text-muted">{dict.partners.passwordHint}</span>
        <FieldError lang={lang} code={state.errors.password} />
      </label>
      <Consent lang={lang} />
      <button className={btnPrimary} disabled={pending}>{dict.partners.submit}</button>
    </form>
  );
}
