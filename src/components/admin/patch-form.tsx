"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PatchForm({ action, children }: { action: string; children: React.ReactNode }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="grid gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        setSaved(false);
        const form = new FormData(event.currentTarget);
        try {
          const response = await fetch(action, {
            method: "PATCH",
            headers: { "content-type": "application/json", accept: "application/json" },
            body: JSON.stringify(Object.fromEntries(form.entries())),
          });
          const data = (await response.json()) as { ok?: boolean; code?: string; errors?: Record<string, string> };
          if (!response.ok || !data.ok) {
            setError(data.errors ? Object.values(data.errors).join(" ") : "저장하지 못했습니다.");
            return;
          }
          setSaved(true);
          router.refresh();
        } catch {
          setError("저장하지 못했습니다.");
        } finally {
          setPending(false);
        }
      }}
    >
      {error ? (
        <p role="alert" className="text-sm text-[#9f1239]">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-sm text-[#166534]">
          저장했습니다.
        </p>
      ) : null}
      {children}
      <button disabled={pending} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "저장 중" : "저장"}
      </button>
    </form>
  );
}

export function SettingsForm({
  settings,
}: {
  settings: {
    companyName: string;
    phone: string | null;
    kakaoUrl: string | null;
    whatsappE164: string | null;
    email: string | null;
    address: string | null;
    businessHours: string | null;
    aboutKo: string | null;
    aboutEn: string | null;
    privacyPolicyKo: string | null;
    privacyPolicyEn: string | null;
    privacyCollectionEnabled: boolean;
  };
}) {
  const router = useRouter();
  return (
    <PatchForm action="/api/admin/settings">
      {[
        ["companyName", "회사명", settings.companyName],
        ["phone", "전화", settings.phone ?? ""],
        ["email", "이메일", settings.email ?? ""],
        ["address", "주소", settings.address ?? ""],
        ["businessHours", "영업시간", settings.businessHours ?? ""],
        ["kakaoUrl", "카카오톡 https 링크", settings.kakaoUrl ?? ""],
        ["whatsappE164", "WhatsApp 국가번호 숫자", settings.whatsappE164 ?? ""],
      ].map(([name, label, value]) => (
        <label key={name} className="grid gap-1 text-sm">
          {label}
          <input name={name} defaultValue={value} className="rounded-md border border-line px-3 py-2" />
        </label>
      ))}
      <label className="grid gap-1 text-sm">
        소개 한국어
        <textarea name="aboutKo" defaultValue={settings.aboutKo ?? ""} rows={3} className="rounded-md border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm">
        소개 영어
        <textarea name="aboutEn" defaultValue={settings.aboutEn ?? ""} rows={3} className="rounded-md border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm">
        개인정보 안내 한국어
        <textarea name="privacyPolicyKo" defaultValue={settings.privacyPolicyKo ?? ""} rows={5} className="rounded-md border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm">
        개인정보 안내 영어
        <textarea name="privacyPolicyEn" defaultValue={settings.privacyPolicyEn ?? ""} rows={5} className="rounded-md border border-line px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="privacyCollectionEnabled" type="checkbox" value="true" defaultChecked={settings.privacyCollectionEnabled} />
        실제 개인정보 수집 활성화. 한국어·영어 안내가 모두 있어야 합니다.
      </label>
      <button type="button" className="hidden" onClick={() => router.refresh()} />
    </PatchForm>
  );
}
