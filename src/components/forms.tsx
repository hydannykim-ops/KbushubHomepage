"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/domain/types";
import { scrollFormAlert } from "@/lib/http/scroll-form-alert";
import { copy, submitMessage } from "@/lib/i18n";

export function SubmitBanner({ lang, submitted, error }: { lang: Lang; submitted?: string; error?: string }) {
  const message = submitMessage(lang, submitted, error);
  if (!message) return null;
  const ok = submitted === "demo" || submitted === "live";
  return (
    <p role={ok ? "status" : "alert"} className={`mb-4 scroll-mt-28 rounded-md border px-3 py-2 text-sm ${ok ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-[#fecdd3] bg-[#fff1f2]"}`}>
      {message}
    </p>
  );
}

export function EnhanceForm({
  action,
  lang,
  children,
}: {
  action: string;
  lang: Lang;
  children: React.ReactNode;
}) {
  const text = copy(lang);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [scrollToken, setScrollToken] = useState(0);

  useEffect(() => {
    if (!scrollToken || !formRef.current) return;
    scrollFormAlert(formRef.current, fieldErrors);
  }, [scrollToken, fieldErrors, message]);

  return (
    <form
      ref={formRef}
      action={action}
      method="post"
      encType="multipart/form-data"
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage(null);
        const form = event.currentTarget;
        try {
          const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { accept: "application/json" },
          });
          const data = (await response.json()) as { ok?: boolean; demo?: boolean; code?: string; errors?: Record<string, string> };
          if (data.errors) setFieldErrors(data.errors);
          else setFieldErrors({});
          if (response.ok && data.ok) {
            setMessage({ ok: true, text: text.submittedLive });
            form.reset();
          } else {
            setMessage({ ok: false, text: text.errors[(data.code ?? "save_failed") as keyof typeof text.errors] ?? text.errors.save_failed });
            setScrollToken((value) => value + 1);
          }
        } catch {
          setFieldErrors({});
          setMessage({ ok: false, text: text.errors.save_failed });
          setScrollToken((value) => value + 1);
        } finally {
          setPending(false);
        }
      }}
    >
      {message ? (
        <p role={message.ok ? "status" : "alert"} className={`scroll-mt-28 rounded-md border px-3 py-2 text-sm ${message.ok ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-[#fecdd3] bg-[#fff1f2]"}`}>
          {message.text}
        </p>
      ) : null}
      <FieldErrors errors={fieldErrors} />
      {children}
      <button type="submit" disabled={pending} className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "..." : text.submit}
      </button>
    </form>
  );
}

function FieldErrors({ errors }: { errors: Record<string, string> }) {
  const entries = Object.entries(errors);
  if (!entries.length) return null;
  return (
    <ul className="grid scroll-mt-28 gap-1 text-sm text-[#9f1239]" role="alert">
      {entries.map(([key, value]) => (
        <li key={key}>{value}</li>
      ))}
    </ul>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
  as = "input",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  as?: "input" | "textarea";
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      {as === "textarea" ? (
        <textarea
          name={name}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={5}
          className="rounded-md border border-line px-3 py-2 font-normal"
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="rounded-md border border-line px-3 py-2 font-normal"
        />
      )}
    </label>
  );
}

export function Consent({ lang }: { lang: Lang }) {
  const text = copy(lang);
  return (
    <label className="flex items-start gap-2 text-sm">
      <input name="consent" type="checkbox" value="true" required className="mt-1" />
      <span>{text.consent}</span>
    </label>
  );
}

export function Honeypot({ lang }: { lang: Lang }) {
  return (
    <label className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
      {copy(lang).honeypot}
      <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
    </label>
  );
}
