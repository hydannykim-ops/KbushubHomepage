"use client";

import { useActionState } from "react";
import { FormNotice } from "@/components/form-bits";
import { loginAdmin, loginAgent } from "@/lib/actions";
import { emptyForm } from "@/lib/form-state";
import { getDict } from "@/lib/i18n";
import { btnPrimary, fieldClass } from "@/lib/ui";
import type { Locale } from "@/lib/types";

export function AuthForm({ lang, mode }: { lang: Locale; mode: "admin" | "agent" }) {
  const dict = getDict(lang);
  const action = mode === "admin" ? loginAdmin : loginAgent;
  const [state, formAction, pending] = useActionState(action, emptyForm);
  const copy = mode === "admin" ? dict.admin : dict.agent;
  return (
    <form action={formAction} className="grid gap-4">
      <FormNotice lang={lang} state={state} />
      <input type="hidden" name="lang" value={lang} />
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.admin.email}
        <input name="email" type="email" required autoComplete="username" className={fieldClass} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.admin.password}
        <input name="password" type="password" required autoComplete="current-password" className={fieldClass} />
      </label>
      <button className={btnPrimary} disabled={pending}>{copy.login === dict.agent.login && mode === "agent" ? dict.agent.login : dict.admin.enter}</button>
    </form>
  );
}
