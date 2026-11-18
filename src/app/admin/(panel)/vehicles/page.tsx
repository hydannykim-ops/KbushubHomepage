import Link from "next/link";
import { VehicleOps } from "@/components/admin/vehicle-ops";
import { getRepository } from "@/lib/data/repository";
import { usdFromKrw } from "@/lib/domain/money";
import { statusLabel } from "@/lib/labels";
import type { SaleStatus } from "@/lib/domain/types";

const statuses = ["available", "reserved", "sold", "hidden", "review"] as const satisfies readonly SaleStatus[];

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filter = typeof sp.status === "string" ? sp.status : "";
  const query = typeof sp.q === "string" ? sp.q.trim() : "";
  const needle = query.toLowerCase();
  const vehicles = await getRepository().listAdminVehicles();
  const counts = Object.fromEntries(statuses.map((status) => [status, vehicles.filter((vehicle) => vehicle.status === status).length])) as Record<
    SaleStatus,
    number
  >;
  const visible = vehicles
    .filter((vehicle) => (filter ? vehicle.status === filter : true))
    .filter((vehicle) => {
      if (!needle) return true;
      return [vehicle.stockNo, vehicle.maker, vehicle.model, vehicle.trim, vehicle.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const returnTo = `/admin/vehicles${filter || query ? `?${new URLSearchParams({ ...(filter ? { status: filter } : {}), ...(query ? { q: query } : {}) }).toString()}` : ""}`;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">매물 관리</h1>
          <p className="mt-1 text-sm text-muted">등록·상태 변경·판매 완료·삭제는 이 화면에서 합니다. 공개 회원 매물 등록은 받지 않습니다.</p>
        </div>
        <Link href="/admin/vehicles/new" className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white">
          매물 등록
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/admin/vehicles">
        {filter ? <input type="hidden" name="status" value={filter} /> : null}
        <input
          name="q"
          defaultValue={query}
          placeholder="매물번호, 제조사, 모델"
          className="min-w-56 flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm"
        />
        <button className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold">검색</button>
      </form>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={query ? `/admin/vehicles?q=${encodeURIComponent(query)}` : "/admin/vehicles"} className={!filter ? "rounded-full bg-ink px-3 py-1 font-semibold text-white" : "rounded-full border border-line bg-white px-3 py-1 text-muted"}>
          전체 {vehicles.length}
        </Link>
        {statuses.map((status) => (
          <Link
            key={status}
            href={`/admin/vehicles?status=${status}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={filter === status ? "rounded-full bg-ink px-3 py-1 font-semibold text-white" : "rounded-full border border-line bg-white px-3 py-1 text-muted"}
          >
            {statusLabel(status, "ko")} {counts[status]}
          </Link>
        ))}
      </div>

      <div className="grid gap-3">
        {visible.length ? (
          visible.map((vehicle) => {
            const cover = vehicle.photos.find((photo) => photo.isCover && !photo.placeholder) ?? vehicle.photos.find((photo) => !photo.placeholder);
            return (
              <article key={vehicle.id} className="grid gap-3 rounded-lg border border-line bg-white p-3 md:grid-cols-[5.5rem_minmax(0,1fr)]">
                <Link href={`/admin/vehicles/${vehicle.id}`} className="block">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/media/photo/${cover.id}`} alt="" className="h-20 w-full rounded-md object-cover md:h-16" />
                  ) : (
                    <span className="inline-flex h-20 w-full items-center justify-center rounded-md bg-[#eef1f5] text-[10px] text-muted md:h-16">사진 없음</span>
                  )}
                </Link>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <Link href={`/admin/vehicles/${vehicle.id}`} className="text-base font-semibold text-ink">
                        {vehicle.stockNo}
                      </Link>
                      <p className="text-sm text-muted">
                        {vehicle.maker} {vehicle.model}
                        {vehicle.trim ? ` ${vehicle.trim}` : ""}
                        {vehicle.modelYear ? ` · ${vehicle.modelYear}` : ""}
                        {vehicle.location ? ` · ${vehicle.location}` : ""}
                      </p>
                    </div>
                    <p className="text-sm text-muted">
                      {vehicle.domesticPriceKrw != null
                        ? `국내 ${vehicle.domesticPriceKrw.toLocaleString("ko-KR")}원 · $${usdFromKrw(vehicle.domesticPriceKrw).toLocaleString("en-US")}`
                        : "가격 문의"}
                    </p>
                  </div>
                  <div className="mt-3">
                    <VehicleOps id={vehicle.id} stockNo={vehicle.stockNo} status={vehicle.status} returnTo={returnTo} />
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <p className="rounded-lg border border-dashed border-line bg-white px-4 py-10 text-center text-sm text-muted">표시할 매물이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
