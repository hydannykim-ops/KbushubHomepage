"use client";

import { useState } from "react";
import { MakerModelPicker } from "@/components/maker-model-picker";
import type { Lang } from "@/lib/domain/types";
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
        const data = (await response.json()) as { ok?: boolean; code?: string; errors?: Record<string, string> };
        setPending(false);
        if (response.ok && data.ok) {
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

export function DealerListingForm({ lang }: { lang: Lang }) {
  const text = copy(lang);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [vehicleClass, setVehicleClass] = useState<"county" | "medium" | "large">("county");

  return (
    <form
      className="grid gap-4"
      encType="multipart/form-data"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage(null);
        const form = event.currentTarget;
        const payload = new FormData(form);
        if (!String(payload.get("maker") ?? "").trim() || !String(payload.get("model") ?? "").trim()) {
          setPending(false);
          setMessage({ ok: false, text: text.pickMakerModel });
          return;
        }
        const response = await fetch("/api/listings", {
          method: "POST",
          headers: { accept: "application/json" },
          body: payload,
        });
        const data = (await response.json()) as { ok?: boolean; code?: string; errors?: Record<string, string> };
        setPending(false);
        if (response.ok && data.ok) {
          setMessage({ ok: true, text: text.listingSaved });
          form.reset();
          setVehicleClass("county");
          return;
        }
        const code = data.code ?? "save_failed";
        const known = text.errors[code as keyof typeof text.errors];
        setMessage({ ok: false, text: data.errors ? Object.values(data.errors).join(" ") : known ?? text.errors.save_failed });
      }}
    >
      <input type="hidden" name="lang" value={lang} />
      {message ? (
        <p role={message.ok ? "status" : "alert"} className={`border px-3 py-2 text-sm ${message.ok ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-[#fecdd3] bg-[#fff1f2]"}`}>
          {message.text}
        </p>
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
      <p className="text-sm text-muted">{text.photoRequired}</p>
      <label className="grid gap-1 text-sm font-medium">
        {text.photoFront}
        <input name="front" type="file" accept="image/jpeg,image/png,image/webp" required className="font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.photoFrontSide}
        <input name="frontSide" type="file" accept="image/jpeg,image/png,image/webp" required className="font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.photoRear}
        <input name="rear" type="file" accept="image/jpeg,image/png,image/webp" required className="font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {text.photoExtra}
        <input name="extras" type="file" accept="image/jpeg,image/png,image/webp" multiple className="font-normal" />
      </label>
      <button disabled={pending} className="bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {text.submit}
      </button>
    </form>
  );
}
