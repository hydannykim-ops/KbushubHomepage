import Link from "next/link";
import { VehicleStatusButton } from "@/components/admin/vehicle-status-button";
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

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-3 py-2">사진</th>
              <th className="px-3 py-2">매물번호</th>
              <th className="px-3 py-2">모델</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">출처</th>
              <th className="px-3 py-2">판매자</th>
              <th className="px-3 py-2">국내가</th>
              <th className="px-3 py-2">수출가</th>
              <th className="px-3 py-2">빠른 처리</th>
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((vehicle) => {
                const href = `/admin/vehicles/${encodeURIComponent(vehicle.id)}`;
                const cover =
                  vehicle.photos.find((photo) => photo.isCover && !photo.placeholder) ??
                  vehicle.photos.find((photo) => !photo.placeholder);
                return (
                  <tr key={vehicle.id} className="border-b border-line hover:bg-[#f7f9fc]">
                    <td className="px-3 py-2">
                      <Link href={href} className="block" aria-label={`${vehicle.stockNo} 상세`}>
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/api/media/photo/${cover.id}?w=320`} alt="" className="h-12 w-16 object-cover" />
                        ) : (
                          <span className="inline-flex h-12 w-16 items-center justify-center bg-[#eef1f5] text-[10px] text-muted">없음</span>
                        )}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link href={href} className="font-semibold text-primary">
                        {vehicle.stockNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link href={href} className="text-ink hover:text-primary">
                        {vehicle.maker} {vehicle.model}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link href={href} className="text-ink hover:text-primary">
                        {statusLabel(vehicle.status, "ko")}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link href={href} className="text-ink hover:text-primary">
                        {vehicle.listingSource === "dealer" ? "딜러" : "회사"}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link href={href} className="text-ink hover:text-primary">
                        {vehicle.listingSource === "dealer"
                          ? [vehicle.sellerName, vehicle.sellerEmail, vehicle.sellerCompany].filter(Boolean).join(" · ") || "-"
                          : "-"}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link href={href} className="text-ink hover:text-primary">
                        {vehicle.domesticPriceKrw ?? "가격 문의"}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link href={href} className="text-ink hover:text-primary">
                        {vehicle.exportPriceAmount != null
                          ? `${vehicle.exportPriceAmount} ${vehicle.exportPriceCurrency}`
                          : "가격 문의"}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <Link href={href} className="rounded-md border border-line px-2 py-1 text-xs font-semibold text-ink hover:bg-[#f3f5f8]">
                          상세
                        </Link>
                        {vehicle.status === "review" ? (
                          <>
                            <VehicleStatusButton
                              vehicleId={vehicle.id}
                              status="available"
                              label="공개"
                              className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
                            />
                            <VehicleStatusButton vehicleId={vehicle.id} status="hidden" label="비공개" />
                          </>
                        ) : null}
                        {vehicle.status === "available" ? (
                          <>
                            <VehicleStatusButton vehicleId={vehicle.id} status="reserved" label="예약" />
                            <VehicleStatusButton vehicleId={vehicle.id} status="sold" label="완료" />
                            <VehicleStatusButton vehicleId={vehicle.id} status="hidden" label="비공개" />
                          </>
                        ) : null}
                        {vehicle.status === "reserved" ? (
                          <>
                            <VehicleStatusButton vehicleId={vehicle.id} status="available" label="판매중" />
                            <VehicleStatusButton vehicleId={vehicle.id} status="sold" label="완료" />
                          </>
                        ) : null}
                        {vehicle.status === "sold" ? (
                          <>
                            <VehicleStatusButton vehicleId={vehicle.id} status="available" label="재판매" />
                            <VehicleStatusButton vehicleId={vehicle.id} status="hidden" label="비공개" />
                          </>
                        ) : null}
                        {vehicle.status === "hidden" ? (
                          <VehicleStatusButton
                            vehicleId={vehicle.id}
                            status="available"
                            label="공개"
                            className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
                          />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-muted">
                  표시할 매물이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
