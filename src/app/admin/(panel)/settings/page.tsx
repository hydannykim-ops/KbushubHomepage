import { SettingsForm } from "@/components/admin/patch-form";
import { getRepository } from "@/lib/data/repository";

export default async function SettingsPage() {
  const settings = await getRepository().getSettings();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">사이트 설정</h1>
      <p className="mb-4 text-sm text-muted">연락처를 비워 두면 공개 화면은 가짜 번호 대신 문의 폼을 보여 줍니다. 개인정보 수집은 안내 문안을 저장한 뒤에만 켤 수 있습니다.</p>
      <div className="rounded-lg border border-line bg-white p-4">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
