import Link from "next/link";
import { QuickVehicleCreate } from "@/components/admin/quick-vehicle-create";
import { VehicleForm } from "@/components/admin/editors";

export default async function NewVehiclePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const full = raw.full === "1" || raw.full === "true";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{full ? "매물 상세 등록" : "매물 빠른 등록"}</h1>
          <p className="mt-1 text-sm text-muted">
            {full
              ? "모든 항목을 직접 입력합니다."
              : "문구 붙여넣기 + 사진 순서로 등록합니다. 가격·위치 등은 등록 후 상세에서 보완하세요."}
          </p>
        </div>
        {full ? (
          <Link href="/admin/vehicles/new" className="text-sm font-semibold text-primary">
            빠른 등록으로
          </Link>
        ) : (
          <Link href="/admin/vehicles/new?full=1" className="text-sm font-semibold text-primary">
            전체 폼으로
          </Link>
        )}
      </div>
      {full ? (
        <div className="rounded-lg border border-line bg-white p-4">
          <VehicleForm vehicle={null} />
        </div>
      ) : (
        <QuickVehicleCreate />
      )}
    </div>
  );
}
