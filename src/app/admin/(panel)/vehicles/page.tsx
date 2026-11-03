import Link from "next/link";
import { VehicleAdminTable, type VehicleAdminRow } from "@/components/admin/vehicle-admin-table";
import { getRepository } from "@/lib/data/repository";
import { statusLabel } from "@/lib/labels";
import type { SaleStatus } from "@/lib/domain/types";

const statusRank: Record<SaleStatus, number> = {
  review: 0,
  available: 1,
  reserved: 2,
  sold: 3,
  hidden: 4,
};

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filter = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const vehicles = (await getRepository().listAdminVehicles()).slice().sort((a, b) => {
    const rank = statusRank[a.status] - statusRank[b.status];
    if (rank !== 0) return rank;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
  const visible = vehicles.filter((vehicle) => {
    if (filter && vehicle.status !== filter) return false;
    if (!q) return true;
    const haystack = [vehicle.stockNo, vehicle.maker, vehicle.model, vehicle.sellerName, vehicle.sellerEmail, vehicle.sellerCompany]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
  const reviewCount = vehicles.filter((vehicle) => vehicle.status === "review").length;
  const rows: VehicleAdminRow[] = visible.map((vehicle) => {
    const cover = vehicle.photos.find((photo) => photo.isCover && !photo.placeholder) ?? vehicle.photos.find((photo) => !photo.placeholder);
    return {
      id: vehicle.id,
      stockNo: vehicle.stockNo,
      maker: vehicle.maker,
      model: vehicle.model,
      status: vehicle.status,
      listingSource: vehicle.listingSource,
      sellerName: vehicle.sellerName,
      sellerEmail: vehicle.sellerEmail,
      sellerCompany: vehicle.sellerCompany,
      domesticPriceKrw: vehicle.domesticPriceKrw,
      exportPriceAmount: vehicle.exportPriceAmount,
      exportPriceCurrency: vehicle.exportPriceCurrency,
      coverPhotoId: cover?.id ?? null,
      statusLabel: statusLabel(vehicle.status, "ko"),
    };
  });

  function hrefFor(status: string) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin/vehicles?${qs}` : "/admin/vehicles";
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">매물 관리</h1>
          <p className="mt-1 text-sm text-muted">선택 후 상태 일괄 변경·삭제가 가능합니다. 개별 행에서도 상세·상태·삭제를 바로 할 수 있습니다.</p>
          {reviewCount ? (
            <p className="mt-1 text-sm text-muted">
              딜러 등록 대기 <span className="font-semibold text-ink">{reviewCount}</span>건 · 상단에 먼저 보입니다.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form className="flex gap-2" action="/admin/vehicles" method="get">
            {filter ? <input type="hidden" name="status" value={filter} /> : null}
            <input
              name="q"
              defaultValue={q}
              placeholder="매물번호·모델·판매자 검색"
              className="min-w-[14rem] rounded-md border border-line px-3 py-2 text-sm"
            />
            <button className="rounded-md border border-line px-3 py-2 text-sm font-semibold">검색</button>
          </form>
          <Link href="/admin/vehicles/new" className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white">
            매물 등록
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={hrefFor("")} className={!filter ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
          전체
        </Link>
        {(["review", "available", "reserved", "sold", "hidden"] as const).map((status) => (
          <Link
            key={status}
            href={hrefFor(status)}
            className={filter === status ? "font-semibold text-ink" : "text-muted hover:text-ink"}
          >
            {statusLabel(status, "ko")}
          </Link>
        ))}
      </div>

      <VehicleAdminTable vehicles={rows} />
    </div>
  );
}
