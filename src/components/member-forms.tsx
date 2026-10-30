"use client";

import { useEffect, useRef, useState } from "react";
import { MakerModelPicker } from "@/components/maker-model-picker";
import { PhotoSlotUploader } from "@/components/photo-slot-uploader";
import { compressFormImages } from "@/lib/domain/compress-image-client";
import type { Lang } from "@/lib/domain/types";
import { scrollFormAlert } from "@/lib/http/scroll-form-alert";
import { copy } from "@/lib/i18n";

const field = "border border-line bg-white px-3 py-2.5 font-normal";

export function SignupForm({
  lang,
  nextPath,
  role,
}: {
  lang: Lang;
  nextPath: string;
  role: "customer" | "dealer";
}) {
  const text = copy(lang);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dealer = role === "dealer";

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage(null);
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { accept: "application/json" },
          body: form,
        });
        const data = (await response.json()) as { ok?: boolean; code?: string; errors?: Record<string, string>; loginRequired?: boolean };
        setPending(false);
        if (response.status === 409 || data.code === "duplicate_email") {
          setMessage(text.errors.duplicate_email + " " + text.signupUseLogin);
          return;
        }
        if (response.ok && data.ok) {
          if (data.loginRequired) {
            window.location.href = `/${lang}/account/login`;
            return;
          }
          window.location.href = nextPath;
          return;
        }
        const code = data.code ?? "save_failed";
        const known = text.errors[code as keyof typeof text.errors];
        setMessage(data.errors ? Object.values(data.errors).join(" ") : known ?? text.errors.save_failed);
      }}
    >
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="role" value={role} />
      {message ? (
        <p role="alert" className="border border-[#fecdd3] bg-[#fff1f2] px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}

      {dealer ? (
        <>
          <label className="grid gap-1 text-sm font-medium">
            {text.company} *
            <input name="company" required className={field} autoComplete="organization" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {text.dealerName} *
            <input name="name" required className={field} autoComplete="name" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {text.businessPhone}
            <input name="phone" className={field} autoComplete="tel" />
          </label>
        </>
      ) : (
        <>
          <label className="grid gap-1 text-sm font-medium">
            {text.customerName} *
            <input name="name" required className={field} autoComplete="name" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {text.contact}
            <input name="phone" className={field} autoComplete="tel" />
          </label>
        </>
      )}

      <label className="grid gap-1 text-sm font-medium">
        {text.country} *
        <input name="country" required defaultValue={lang === "ko" ? "한국" : ""} className={field} autoComplete="country-name" />
        <span className="font-normal text-muted">{text.countryHint}</span>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.email} *
        <input name="email" type="email" required autoComplete="username" className={field} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.password} *
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} />
        <span className="font-normal text-muted">{text.passwordHint}</span>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.passwordConfirm} *
        <input name="passwordConfirm" type="password" required minLength={8} autoComplete="new-password" className={field} />
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input name="consent" type="checkbox" value="true" required className="mt-1" />
        <span>{text.consent}</span>
      </label>
      <label className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        {text.honeypot}
        <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </label>
      <button disabled={pending} className="bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {dealer ? text.signupDealerCta : text.signupCustomerCta}
      </button>
    </form>
  );
}

export function ProfileForm({
  lang,
  role,
  initial,
}: {
  lang: Lang;
  role: "customer" | "dealer";
  initial: { name: string; email: string; phone: string | null; company: string | null; country: string | null };
}) {
  const text = copy(lang);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const dealer = role === "dealer";

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage(null);
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/account/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            phone: form.get("phone"),
            company: form.get("company"),
          }),
        });
        const data = (await response.json()) as { ok?: boolean; code?: string };
        setPending(false);
        if (response.ok && data.ok) {
          setMessage({ ok: true, text: text.profileSaved });
          return;
        }
        setMessage({ ok: false, text: text.errors[data.code as keyof typeof text.errors] ?? text.errors.save_failed });
      }}
    >
      {message ? (
        <p role={message.ok ? "status" : "alert"} className={`border px-3 py-2 text-sm ${message.ok ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-[#fecdd3] bg-[#fff1f2]"}`}>
          {message.text}
        </p>
      ) : null}
      {dealer ? (
        <label className="grid gap-1 text-sm font-medium">
          {text.company} *
          <input name="company" required defaultValue={initial.company ?? ""} className={field} autoComplete="organization" />
        </label>
      ) : null}
      <label className="grid gap-1 text-sm font-medium">
        {dealer ? text.dealerName : text.customerName} *
        <input name="name" required defaultValue={initial.name} className={field} autoComplete="name" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.email}
        <input value={initial.email} disabled className={`${field} bg-[#f7f9fb] text-muted`} />
        <span className="font-normal text-xs text-muted">{text.emailLockedHint}</span>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.country}
        <input value={initial.country ?? ""} disabled className={`${field} bg-[#f7f9fb] text-muted`} />
        <span className="font-normal text-xs text-muted">{text.countryLockedHint}</span>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {dealer ? text.businessPhone : text.contact}
        <input name="phone" defaultValue={initial.phone ?? ""} className={field} autoComplete="tel" />
      </label>
      <button disabled={pending} className="bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {text.saveProfile}
      </button>
    </form>
  );
}

export function DealerListingForm({ lang }: { lang: Lang }) {
  const text = copy(lang);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [pending, setPending] = useState(false);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string; diag?: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [vehicleClass, setVehicleClass] = useState<"county" | "medium" | "large">("county");
  const [photoReset, setPhotoReset] = useState(0);
  const [scrollToken, setScrollToken] = useState(0);

  useEffect(() => {
    if (!scrollToken || !formRef.current) return;
    scrollFormAlert(formRef.current, fieldErrors);
  }, [scrollToken, fieldErrors, message]);

  return (
    <form
      ref={formRef}
      className="grid gap-4"
      encType="multipart/form-data"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setPendingLabel(lang === "ko" ? "사진 줄이는 중…" : "Compressing photos…");
        setMessage(null);
        setFieldErrors({});
        const form = event.currentTarget;
        const payload = new FormData(form);
        if (!String(payload.get("maker") ?? "").trim() || !String(payload.get("model") ?? "").trim()) {
          setPending(false);
          setPendingLabel(null);
          setMessage({ ok: false, text: text.pickMakerModel });
          setScrollToken((value) => value + 1);
          return;
        }
        try {
          const compressed = await compressFormImages(payload);
          setPendingLabel(lang === "ko" ? "올리는 중…" : "Uploading…");
          const response = await fetch("/api/listings", {
            method: "POST",
            headers: { accept: "application/json" },
            body: compressed,
          });
          let data: {
            ok?: boolean;
            code?: string;
            errors?: Record<string, string>;
            step?: string;
            detail?: string;
            stockNo?: string;
            id?: string;
          } = {};
          try {
            data = (await response.json()) as typeof data;
          } catch {
            data = {};
          }
          setPending(false);
          setPendingLabel(null);
          if (response.ok && data.ok) {
            if (data.stockNo) {
              window.location.href = `/${lang}/vehicles/${encodeURIComponent(data.stockNo)}`;
              return;
            }
            setMessage({ ok: true, text: text.listingSaved });
            form.reset();
            setVehicleClass("county");
            setPhotoReset((value) => value + 1);
            return;
          }
          const code =
            response.status === 413 || data.code === "payload_too_large" ? "payload_too_large" : (data.code ?? "save_failed");
          const known = text.errors[code as keyof typeof text.errors];
          const base = data.errors ? Object.values(data.errors).join(" ") : known ?? text.errors.save_failed;
          const parts = [`HTTP ${response.status}`, code];
          if (data.step) parts.push(data.step);
          if (data.detail) parts.push(data.detail);
          if (!data.code && !data.detail) parts.push(lang === "ko" ? "응답 본문 없음(본문 한도 초과 가능)" : "empty body (payload may be too large)");
          setFieldErrors(data.errors ?? {});
          setMessage({ ok: false, text: base, diag: parts.join(" · ") });
          setScrollToken((value) => value + 1);
        } catch (error) {
          setPending(false);
          setPendingLabel(null);
          setMessage({
            ok: false,
            text: text.errors.save_failed,
            diag: `client · ${error instanceof Error ? error.message : String(error)}`.slice(0, 200),
          });
          setScrollToken((value) => value + 1);
        }
      }}
    >
      <input type="hidden" name="lang" value={lang} />
      {message ? (
        <div
          role={message.ok ? "status" : "alert"}
          className={`scroll-mt-28 border px-3 py-2 text-sm ${message.ok ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-[#fecdd3] bg-[#fff1f2]"}`}
        >
          <p>{message.text}</p>
          {message.diag ? <p className="mt-1 break-all font-mono text-xs text-[#9f1239]">{message.diag}</p> : null}
        </div>
      ) : null}
      <label className="grid gap-1 text-sm font-medium">
        {text.classLabel}
        <select
          name="vehicleClass"
          className={field}
          value={vehicleClass}
          onChange={(event) => setVehicleClass(event.target.value as "county" | "medium" | "large")}
        >
          <option value="county">{text.classCounty}</option>
          <option value="medium">{text.classMedium}</option>
          <option value="large">{text.classLarge}</option>
        </select>
      </label>
      <MakerModelPicker key={vehicleClass} lang={lang} required vehicleClass={vehicleClass} />
      <label className="grid gap-1 text-sm font-medium">
        {text.modelYear}
        <input name="modelYear" inputMode="numeric" placeholder="2017" className={field} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.mileage}
        <input name="mileageKm" inputMode="numeric" placeholder="150000" className={field} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.seats}
        <input name="seats" inputMode="numeric" placeholder="28" className={field} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.transmission}
        <select name="transmission" className={field} defaultValue="unknown">
          <option value="unknown">{text.unknown}</option>
          <option value="automatic">AT</option>
          <option value="manual">MT</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.fuel}
        <select name="fuel" className={field} defaultValue="diesel">
          <option value="diesel">Diesel</option>
          <option value="gasoline">Gasoline</option>
          <option value="lpg">LPG</option>
          <option value="cng">CNG</option>
          <option value="electric">EV</option>
          <option value="hybrid">Hybrid</option>
          <option value="unknown">{text.unknown}</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.location}
        <input name="location" className={field} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.price} (KRW)
        <input name="domesticPriceKrw" type="number" className={field} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.description}
        <textarea name="descriptionKo" rows={4} className={field} />
      </label>
      <PhotoSlotUploader lang={lang} resetKey={photoReset} />
      <button disabled={pending} className="bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pendingLabel ?? text.submit}
      </button>
    </form>
  );
}
