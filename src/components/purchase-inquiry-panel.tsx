"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExportInquiryFields } from "@/components/export-inquiry-fields";
import { Consent, EnhanceForm, Field, Honeypot } from "@/components/forms";
import type { Lang, TradeMode } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";

type MemberPrefill = {
  name: string;
  email: string;
  phone: string | null;
};

export function PurchaseInquiryPanel({
  lang,
  mode,
  stockNo,
  member,
  loginHref,
  signupHref,
  ctaLabel,
  autoOpen = false,
}: {
  lang: Lang;
  mode: TradeMode;
  stockNo: string;
  member: MemberPrefill | null;
  loginHref: string;
  signupHref: string;
  ctaLabel: string;
  autoOpen?: boolean;
}) {
  const text = copy(lang);
  const [open, setOpen] = useState(autoOpen);
  const kind = mode === "export" ? "quote" : "purchase";

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
        <div className="mt-4 border border-line bg-white p-4">
          {!member ? (
            <div className="grid gap-3 text-sm">
              <p className="leading-6 text-muted">{text.inquiryLoginRequired}</p>
              <div className="flex flex-wrap gap-3">
                <Link href={loginHref} className="rounded-md bg-primary px-4 py-2.5 font-semibold text-white">
                  {text.navLogin}
                </Link>
                <Link href={signupHref} className="rounded-md border border-line px-4 py-2.5 font-semibold">
                  {text.navSignup}
                </Link>
              </div>
            </div>
          ) : (
            <EnhanceForm action="/api/inquiries" lang={lang}>
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="tradeMode" value={mode} />
              <input type="hidden" name="stockNo" value={stockNo} />
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="name" value={member.name} />
              <input type="hidden" name="email" value={member.email} />
              <input type="hidden" name="phone" value={member.phone ?? ""} />
              {mode === "domestic" ? <input type="hidden" name="country" value="한국" /> : null}

              <div className="rounded-md border border-line bg-[#f7f9fb] px-3 py-3 text-sm">
                <p className="font-medium text-ink">{member.name}</p>
                <p className="mt-1 text-muted">{member.email}</p>
                {member.phone ? <p className="mt-1 text-muted">{member.phone}</p> : null}
                <p className="mt-2 text-xs text-muted">{text.inquiryPrefillNote}</p>
              </div>

              {mode === "export" ? (
                <>
                  <Field label={text.country} name="country" required />
                  <ExportInquiryFields lang={lang} />
                </>
              ) : null}

              <Field label={text.message} name="message" as="textarea" required />
              <Consent lang={lang} />
              <Honeypot lang={lang} />
            </EnhanceForm>
          )}
        </div>
      ) : null}
    </div>
  );
}
