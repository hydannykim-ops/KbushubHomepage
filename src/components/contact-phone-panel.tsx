"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/domain/types";
import { contactTelHref, formatContactPhone } from "@/lib/domain/phone-display";
import { copy } from "@/lib/i18n";

export function ContactPhonePanel({
  lang,
  phone,
  ctaLabel,
  autoOpen = false,
}: {
  lang: Lang;
  phone: string | null;
  ctaLabel: string;
  autoOpen?: boolean;
}) {
  const text = copy(lang);
  const [open, setOpen] = useState(autoOpen);
  const domestic = formatContactPhone(phone, "domestic");
  const international = formatContactPhone(phone, "international");
  const shown = lang === "ko" ? domestic : international;
  const href = contactTelHref(phone);

  useEffect(() => {
    function syncFromHash() {
      if (typeof window === "undefined") return;
      if (window.location.hash === "#inquiry") setOpen(true);
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  function openPanel() {
    setOpen(true);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#inquiry`);
    }
  }

  function closePanel() {
    setOpen(false);
    if (typeof window !== "undefined" && window.location.hash === "#inquiry") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }

  return (
    <div id="inquiry" className="scroll-mt-28">
      <button
        type="button"
        onClick={openPanel}
        className="w-full rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
      >
        {ctaLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="contact-phone-title">
          <div className="w-full max-w-sm border border-line bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <h2 id="contact-phone-title" className="text-lg font-semibold text-ink">
                {ctaLabel}
              </h2>
              <button type="button" onClick={closePanel} className="text-sm font-semibold text-muted hover:text-ink" aria-label={text.close}>
                ✕
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{text.contactPhoneHint}</p>
            {shown && href ? (
              <a href={href} className="mt-5 block rounded-md bg-primary px-4 py-3 text-center text-base font-semibold text-white">
                {shown}
              </a>
            ) : (
              <p className="mt-5 text-sm text-muted">{text.contactMissing}</p>
            )}
            {lang === "ko" && international ? <p className="mt-3 text-center text-xs text-muted">{international}</p> : null}
            {lang !== "ko" && domestic ? <p className="mt-3 text-center text-xs text-muted">{domestic}</p> : null}
            <button type="button" onClick={closePanel} className="mt-4 w-full border border-line px-4 py-2.5 text-sm font-semibold">
              {text.close}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
