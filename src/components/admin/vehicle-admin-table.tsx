"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { notifyAdminSaved } from "@/components/admin/saved-toast";
import { VehicleStatusButton } from "@/components/admin/vehicle-status-button";
import type { SaleStatus } from "@/lib/domain/types";

export type VehicleAdminRow = {
  id: string;
  stockNo: string;
  maker: string;
  model: string;
  status: SaleStatus;
  listingSource: "company" | "dealer";
  sellerName: string | null;
  sellerEmail: string | null;
  sellerCompany: string | null;
  domesticPriceKrw: number | null;
  exportPriceAmount: number | null;
  exportPriceCurrency: string | null;
  coverPhotoId: string | null;
  statusLabel: string;
};

const bulkStatuses: Array<{ value: SaleStatus; label: string }> = [
  { value: "available", label: "판매 중" },
  { value: "reserved", label: "예약 중" },
  { value: "sold", label: "판매 완료" },
  { value: "hidden", label: "비공개" },
  { value: "review", label: "검토 중" },
];

export function VehicleAdminTable({ vehicles }: { vehicles: VehicleAdminRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<SaleStatus>("hidden");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allIds = useMemo(() => vehicles.map((vehicle) => vehicle.id), [vehicles]);
  const allSelected = allIds.length > 0 && selected.length === allIds.length;

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleAll() {
    setSelected(allSelected ? [] : allIds);
  }

  async function runBulk(action: "status" | "delete") {
    if (!selected.length) {
      setError("먼저 매물을 선택해 주세요.");
      return;
    }
    if (action === "delete") {
      if (!window.confirm(`선택한 ${selected.length}건을 삭제할까요? 사진도 함께 지워지며 되돌릴 수 없습니다.`)) return;
    } else if (!window.confirm(`선택한 ${selected.length}건의 상태를 변경할까요?`)) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/vehicles/bulk", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(action === "delete" ? { ids: selected, action } : { ids: selected, action, status: bulkStatus }),
      });
      const data = (await response.json()) as { ok?: boolean; code?: string; count?: number };
      if (!response.ok || !data.ok) {
        setError(data.code || "처리하지 못했습니다.");
        return;
      }
      notifyAdminSaved(action === "delete" ? `${data.count ?? selected.length}건 삭제했습니다.` : `${data.count ?? selected.length}건 상태를 바꿨습니다.`);
      setSelected([]);
      router.refresh();
    } catch {
      setError("처리하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white p-3">
        <p className="text-sm font-semibold text-ink">선택 {selected.length}건</p>
        <select
          value={bulkStatus}
          onChange={(event) => setBulkStatus(event.target.value as SaleStatus)}
          className="rounded-md border border-line px-2 py-1.5 text-sm"
          disabled={pending}
        >
          {bulkStatuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending}
          onClick={() => runBulk("status")}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          상태 일괄 변경
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => runBulk("delete")}
          className="rounded-md border border-[#f1c4c8] px-3 py-1.5 text-sm font-semibold text-[#9f1239] disabled:opacity-60"
        >
          선택 삭제
        </button>
        {error ? <p className="w-full text-sm text-[#9f1239]">{error}</p> : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-3 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="전체 선택" />
              </th>
              <th className="px-3 py-2">사진</th>
              <th className="px-3 py-2">매물번호</th>
              <th className="px-3 py-2">모델</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">출처</th>
              <th className="px-3 py-2">판매자</th>
              <th className="px-3 py-2">국내가</th>
              <th className="px-3 py-2">수출가</th>
              <th className="px-3 py-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length ? (
              vehicles.map((vehicle) => {
                const href = `/admin/vehicles/${encodeURIComponent(vehicle.id)}`;
                return (
                  <tr key={vehicle.id} className="border-b border-line hover:bg-[#f7f9fc]">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(vehicle.id)}
                        onChange={() => toggle(vehicle.id)}
                        aria-label={`${vehicle.stockNo} 선택`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Link href={href} className="block" aria-label={`${vehicle.stockNo} 상세`}>
                        {vehicle.coverPhotoId ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/api/media/photo/${vehicle.coverPhotoId}?w=320`} alt="" className="h-12 w-16 object-cover" />
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
                    <td className="px-3 py-2">{vehicle.statusLabel}</td>
                    <td className="px-3 py-2">{vehicle.listingSource === "dealer" ? "딜러" : "회사"}</td>
                    <td className="px-3 py-2">
                      {vehicle.listingSource === "dealer"
                        ? [vehicle.sellerName, vehicle.sellerEmail, vehicle.sellerCompany].filter(Boolean).join(" · ") || "-"
                        : "-"}
                    </td>
                    <td className="px-3 py-2">{vehicle.domesticPriceKrw ?? "가격 문의"}</td>
                    <td className="px-3 py-2">
                      {vehicle.exportPriceAmount != null
                        ? `${vehicle.exportPriceAmount} ${vehicle.exportPriceCurrency}`
                        : "가격 문의"}
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
                        <AdminDeleteInline vehicleId={vehicle.id} stockNo={vehicle.stockNo} />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-muted">
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

function AdminDeleteInline({ vehicleId, stockNo }: { vehicleId: string; stockNo: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      className="rounded-md border border-[#f1c4c8] px-2 py-1 text-xs font-semibold text-[#9f1239] hover:bg-[#fff1f2] disabled:opacity-60"
      onClick={async () => {
        if (!window.confirm(`${stockNo} 매물을 삭제할까요? 사진도 함께 삭제되며 되돌릴 수 없습니다.`)) return;
        setPending(true);
        try {
          const response = await fetch(`/api/admin/vehicles/${encodeURIComponent(vehicleId)}`, {
            method: "DELETE",
            headers: { accept: "application/json" },
          });
          const data = (await response.json()) as { ok?: boolean };
          if (!response.ok || !data.ok) {
            window.alert("삭제하지 못했습니다.");
            return;
          }
          notifyAdminSaved("삭제되었습니다.");
          router.refresh();
        } catch {
          window.alert("삭제하지 못했습니다.");
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "…" : "삭제"}
    </button>
  );
}
