import { notFound } from "next/navigation";
import { saveSettings } from "@/lib/actions";
import { getDict, isLocale } from "@/lib/i18n";
import { adminGate } from "@/lib/store";
import { btnPrimary, fieldClass } from "@/lib/ui";

export default async function SettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const gate = await adminGate();
  if (!gate.ok) return null;
  const dict = getDict(lang);
  const settings = gate.db.settings;
  const fields = [
    ["companyNameKo", "회사명 KO", settings.companyNameKo],
    ["companyNameEn", "Company EN", settings.companyNameEn],
    ["representative", "대표", settings.representative],
    ["businessNo", "사업자번호", settings.businessNo],
    ["phone", dict.detail.phone, settings.phone],
    ["email", "Email", settings.email],
    ["kakaoUrl", "Kakao URL", settings.kakaoUrl],
    ["whatsapp", "WhatsApp", settings.whatsapp],
    ["addressKo", "주소 KO", settings.addressKo],
    ["addressEn", "Address EN", settings.addressEn],
    ["hoursKo", "시간 KO", settings.hoursKo],
    ["hoursEn", "Hours EN", settings.hoursEn],
  ] as const;
  return (
    <form action={saveSettings} className="grid gap-4 border border-line bg-white p-5 md:grid-cols-2">
      <input type="hidden" name="lang" value={lang} />
      {fields.map(([name, label, value]) => (
        <label key={name} className="grid gap-1.5 text-sm font-medium">
          {label}
          <input name={name} defaultValue={value} className={fieldClass} />
        </label>
      ))}
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input type="checkbox" name="privacyIntakeEnabled" value="yes" defaultChecked={settings.privacyIntakeEnabled} />
        privacyIntakeEnabled
      </label>
      <p className="text-xs leading-5 text-muted md:col-span-2">{dict.privacy.body}</p>
      <button className={btnPrimary}>{dict.admin.save}</button>
    </form>
  );
}
