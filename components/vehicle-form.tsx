"use client";

import { useActionState } from "react";
import { FieldError, FormNotice } from "@/components/form-bits";
import { saveVehicle } from "@/lib/actions";
import { emptyForm } from "@/lib/form-state";
import { getDict } from "@/lib/i18n";
import { areaClass, btnPrimary, fieldClass } from "@/lib/ui";
import type { Locale, Vehicle } from "@/lib/types";

function num(value: number | null | undefined) {
  return value == null ? "" : String(value);
}

export function VehicleForm({ lang, vehicle }: { lang: Locale; vehicle?: Vehicle }) {
  const dict = getDict(lang);
  const [state, action, pending] = useActionState(saveVehicle, emptyForm);
  const v = vehicle;
  return (
    <form action={action} className="grid gap-4">
      <FormNotice lang={lang} state={state} />
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="originalId" value={v?.id || ""} />
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.stock}<input name="id" defaultValue={v?.id || ""} className={fieldClass} /><FieldError lang={lang} code={state.errors.id} /></label>
        <label className="grid gap-1.5 text-sm font-medium">maker key<input name="manufacturerKey" defaultValue={v?.manufacturerKey || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">model key<input name="modelKey" defaultValue={v?.modelKey || ""} className={fieldClass} /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.maker} KO<input name="manufacturerKo" defaultValue={v?.manufacturer.ko || ""} className={fieldClass} /><FieldError lang={lang} code={state.errors.manufacturerKo} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.maker} EN<input name="manufacturerEn" defaultValue={v?.manufacturer.en || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.model} KO<input name="modelKo" defaultValue={v?.model.ko || ""} className={fieldClass} /><FieldError lang={lang} code={state.errors.modelKo} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.model} EN<input name="modelEn" defaultValue={v?.model.en || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.trim} KO<input name="trimKo" defaultValue={v?.trim.ko || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.trim} EN<input name="trimEn" defaultValue={v?.trim.en || ""} className={fieldClass} /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-1.5 text-sm font-medium">{dict.inventory.klass}
          <select name="class" defaultValue={v?.class || "county"} className={fieldClass}>
            <option value="county">{dict.klass.county}</option>
            <option value="medium">{dict.klass.medium}</option>
            <option value="large">{dict.klass.large}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.year}<input name="year" required defaultValue={v?.year || ""} className={fieldClass} /><FieldError lang={lang} code={state.errors.year} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.admin.status}
          <select name="status" defaultValue={v?.status || "available"} className={fieldClass}>
            <option value="available">{dict.status.available}</option>
            <option value="reserved">{dict.status.reserved}</option>
            <option value="sold">{dict.status.sold}</option>
            <option value="hidden">{dict.status.hidden}</option>
          </select>
        </label>
        <label className="mt-7 flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="featured" value="yes" defaultChecked={v?.featured || false} />
          {dict.admin.featured}
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.registered}<input name="firstRegistered" type="date" defaultValue={v?.firstRegistered || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.mileage}<input name="mileageKm" defaultValue={num(v?.mileageKm)} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.seats}<input name="seats" defaultValue={num(v?.seats)} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.transmission}
          <select name="transmission" defaultValue={v?.transmission || "unknown"} className={fieldClass}>
            <option value="manual">{dict.transmission.manual}</option>
            <option value="automatic">{dict.transmission.automatic}</option>
            <option value="unknown">{dict.transmission.unknown}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.fuel}
          <select name="fuel" defaultValue={v?.fuel || "unknown"} className={fieldClass}>
            {(["diesel", "gasoline", "lpg", "cng", "electric", "unknown"] as const).map((fuel) => (
              <option key={fuel} value={fuel}>{dict.fuel[fuel]}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.engine}<input name="engineModel" defaultValue={v?.engineModel || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.displacement}<input name="displacementCc" defaultValue={num(v?.displacementCc)} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.steering}
          <select name="steering" defaultValue={v?.steering || "unknown"} className={fieldClass}>
            <option value="lhd">{dict.steering.lhd}</option>
            <option value="rhd">{dict.steering.rhd}</option>
            <option value="unknown">{dict.steering.unknown}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.longBody}
          <select name="longBody" defaultValue={v?.longBody == null ? "" : v.longBody ? "yes" : "no"} className={fieldClass}>
            <option value="">{dict.common.unknown}</option>
            <option value="yes">{dict.common.yes}</option>
            <option value="no">{dict.common.no}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.length}<input name="lengthMm" defaultValue={num(v?.lengthMm)} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.width}<input name="widthMm" defaultValue={num(v?.widthMm)} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.height}<input name="heightMm" defaultValue={num(v?.heightMm)} className={fieldClass} /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.use} KO<input name="previousUseKo" defaultValue={v?.previousUse?.ko || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.use} EN<input name="previousUseEn" defaultValue={v?.previousUse?.en || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.location} KO<input name="locationKo" defaultValue={v?.location?.ko || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.location} EN<input name="locationEn" defaultValue={v?.location?.en || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.maintenance} KO<textarea name="maintenanceKo" defaultValue={v?.maintenance?.ko || ""} className={areaClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.maintenance} EN<textarea name="maintenanceEn" defaultValue={v?.maintenance?.en || ""} className={areaClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.defects} KO<textarea name="defectsKo" defaultValue={v?.knownDefects?.ko || ""} className={areaClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.defects} EN<textarea name="defectsEn" defaultValue={v?.knownDefects?.en || ""} className={areaClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.about} KO<textarea name="descriptionKo" defaultValue={v?.description.ko || ""} className={areaClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.about} EN<textarea name="descriptionEn" defaultValue={v?.description.en || ""} className={areaClass} /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.shot}<input type="date" name="photographedAt" defaultValue={v?.photographedAt || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.checked}<input type="date" name="stockCheckedAt" defaultValue={v?.stockCheckedAt || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium md:col-span-2">{dict.detail.video}<input name="videoUrl" defaultValue={v?.videoUrl || ""} className={fieldClass} /></label>
      </div>
      <div className="grid gap-4 border border-line p-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">{dict.inventory.basisDomestic}<input name="domesticAmount" defaultValue={num(v?.domesticPrice?.amount)} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.admin.currency}
          <select name="domesticCurrency" defaultValue={v?.domesticPrice?.currency || "KRW"} className={fieldClass}><option>KRW</option><option>USD</option><option>EUR</option></select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.inventory.basisExport}<input name="exportAmount" defaultValue={num(v?.exportPrice?.amount)} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.admin.currency}
          <select name="exportCurrency" defaultValue={v?.exportPrice?.currency || "USD"} className={fieldClass}><option>USD</option><option>EUR</option><option>KRW</option></select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium md:col-span-2">{dict.admin.terms}<input name="exportTerms" defaultValue={v?.exportPrice?.terms || ""} className={fieldClass} /><FieldError lang={lang} code={state.errors.exportTerms} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.includes} KO<input name="exportIncludesKo" defaultValue={v?.exportPrice?.includes.ko || ""} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.detail.includes} EN<input name="exportIncludesEn" defaultValue={v?.exportPrice?.includes.en || ""} className={fieldClass} /></label>
      </div>
      <fieldset className="grid gap-4 border border-line p-4 md:grid-cols-4">
        <legend className="px-1 text-sm font-semibold">{dict.admin.internal}</legend>
        <p className="md:col-span-4 text-xs text-muted">{dict.admin.internalHint} {dict.admin.blankNull}</p>
        <label className="grid gap-1.5 text-sm font-medium">{dict.admin.purchase}<input name="purchaseCost" defaultValue={num(v?.internal?.purchaseCost)} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.admin.actual}<input name="actualSaleAmount" defaultValue={num(v?.internal?.actualSaleAmount)} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.admin.extra}<input name="extraCosts" defaultValue={num(v?.internal?.extraCosts)} className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.admin.fee}<input name="agentFee" defaultValue={num(v?.internal?.agentFee)} className={fieldClass} /></label>
      </fieldset>
      <button className={btnPrimary} disabled={pending}>{dict.admin.save}</button>
    </form>
  );
}
