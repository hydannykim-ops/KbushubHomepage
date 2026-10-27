"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const domestic = formatContactPhone(phone, "domestic");
  const international = formatContactPhone(phone, "international");
  const shown = lang === "ko" ? domestic : international;
  const href = contactTelHref(phone);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function syncFromHash() {
      if (typeof window === "undefined") return;
      if (window.location.hash === "#inquiry") setOpen(true);
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  function openPanel() {
    // Local UI state only — do not rewrite history with replaceState (breaks App Router soft nav).
    setOpen(true);
  }

  function closePanel() {
    setOpen(false);
  }

  const dialog =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-phone-title"
            onClick={closePanel}
          >
            <div
              className="w-full max-w-sm border border-line bg-white p-5 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div id="inquiry" className="scroll-mt-28">
      <button
        type="button"
        onClick={openPanel}
        className="w-full rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
      >
        {ctaLabel}
      </button>
      {dialog}
    </div>
  );
}
