import { errorText, getDict } from "@/lib/i18n";
import type { FormState } from "@/lib/form-state";
import type { Locale } from "@/lib/types";

export function Honeypot() {
  return (
    <div className="absolute -left-[9999px] h-0 overflow-hidden" aria-hidden="true">
      <label htmlFor="company_website">Website</label>
      <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function Consent({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <div className="rounded-2xl bg-paper p-4 shadow-[inset_0_0_0_1px_var(--color-line)]">
      <p className="text-sm leading-6 text-muted">{dict.common.consent}</p>
      <label className="mt-3 flex items-start gap-2 text-sm">
        <input type="checkbox" name="consent" value="yes" className="mt-1" required />
        <span>{dict.common.consentLabel}</span>
      </label>
    </div>
  );
}

export function FormNotice({ lang, state }: { lang: Locale; state: FormState }) {
  const dict = getDict(lang);
  if (state.saved) {
    return (
      <p role="status" className="rounded-2xl bg-card px-4 py-3 text-sm shadow-card">
        {dict.common.demoSaved}
        {state.id ? <span className="mt-1 block font-mono text-xs text-muted">{state.id}</span> : null}
      </p>
    );
  }
  if (!state.errors.form) return null;
  return (
    <p role="alert" className="rounded-2xl bg-card px-4 py-3 text-sm text-[#9f1239] shadow-[inset_0_0_0_1px_#f3d0d8]">
      {errorText(lang, state.errors.form)}
    </p>
  );
}

export function FieldError({ lang, code }: { lang: Locale; code?: string }) {
  if (!code) return null;
  return (
    <p role="alert" className="mt-1 text-sm text-[#9f1239]">
      {errorText(lang, code)}
    </p>
  );
}
