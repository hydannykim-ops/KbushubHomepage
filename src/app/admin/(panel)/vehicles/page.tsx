import Link from "next/link";
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
  const vehicles = (await getRepository().listAdminVehicles()).slice().sort((a, b) => {
    const rank = statusRank[a.status] - statusRank[b.status];
    if (rank !== 0) return rank;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
  const visible = filter ? vehicles.filter((vehicle) => vehicle.status === filter) : vehicles;
  const reviewCount = vehicles.filter((vehicle) => vehicle.status === "review").length;

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
        <Link href="/admin/vehicles/new" className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white">
          매물 등록
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/vehicles" className={!filter ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
          전체
        </Link>
        {(["review", "available", "reserved", "sold", "hidden"] as const).map((status) => (
          <Link
            key={status}
            href={`/admin/vehicles?status=${status}`}
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
              <th className="px-3 py-2">매물번호</th>
              <th className="px-3 py-2">모델</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">출처</th>
              <th className="px-3 py-2">판매자</th>
              <th className="px-3 py-2">국내가</th>
              <th className="px-3 py-2">수출가</th>
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-line">
                  <td className="px-3 py-2">
                    <Link href={`/admin/vehicles/${vehicle.id}`} className="text-primary">
                      {vehicle.stockNo}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {vehicle.maker} {vehicle.model}
                  </td>
                  <td className="px-3 py-2">{statusLabel(vehicle.status, "ko")}</td>
                  <td className="px-3 py-2">{vehicle.listingSource === "dealer" ? "딜러" : "회사"}</td>
                  <td className="px-3 py-2">
                    {vehicle.listingSource === "dealer"
                      ? [vehicle.sellerName, vehicle.sellerEmail, vehicle.sellerCompany].filter(Boolean).join(" · ") || "-"
                      : "-"}
                  </td>
                  <td className="px-3 py-2">{vehicle.domesticPriceKrw ?? "가격 문의"}</td>
                  <td className="px-3 py-2">
                    {vehicle.exportPriceAmount != null ? `${vehicle.exportPriceAmount} ${vehicle.exportPriceCurrency}` : "가격 문의"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted">
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
