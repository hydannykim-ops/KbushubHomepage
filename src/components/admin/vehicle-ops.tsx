"use client";

import Link from "next/link";
import type { SaleStatus } from "@/lib/domain/types";

const statuses: Array<{ value: SaleStatus; label: string }> = [
  { value: "available", label: "판매 중" },
  { value: "reserved", label: "예약 중" },
  { value: "sold", label: "판매 완료" },
  { value: "hidden", label: "비공개" },
  { value: "review", label: "검토 중" },
];

export function VehicleOps({
  id,
  stockNo,
  status,
  returnTo,
  compact = false,
}: {
  id: string;
  stockNo: string;
  status: SaleStatus;
  returnTo: string;
  compact?: boolean;
}) {
  const publicView = status === "available" || status === "reserved" || status === "sold";
  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "text-sm"}`}>
      <Link href={`/admin/vehicles/${id}`} className="rounded-md border border-line bg-white px-2.5 py-1.5 text-sm font-semibold text-ink">
        수정
      </Link>
      {publicView ? (
        <a
          href={`/ko/vehicles/${encodeURIComponent(stockNo)}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-line bg-white px-2.5 py-1.5 text-sm font-semibold text-primary"
        >
          보기
        </a>
      ) : (
        <span className="px-1 text-xs text-muted">비공개</span>
      )}
      <form action={`/api/admin/vehicles/${id}/ops`} method="post" className="flex items-center gap-1">
        <input type="hidden" name="intent" value="status" />
        <input type="hidden" name="returnTo" value={returnTo} />
        <select
          name="status"
          defaultValue={status}
          aria-label={`${stockNo} 상태`}
          className="rounded-md border border-line bg-white px-2 py-1.5 text-sm"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </form>
      {status !== "sold" ? (
        <form action={`/api/admin/vehicles/${id}/ops`} method="post">
          <input type="hidden" name="intent" value="status" />
          <input type="hidden" name="status" value="sold" />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button className="rounded-md bg-ink px-2.5 py-1.5 text-sm font-semibold text-white">판매 완료</button>
        </form>
      ) : (
        <form action={`/api/admin/vehicles/${id}/ops`} method="post">
          <input type="hidden" name="intent" value="status" />
          <input type="hidden" name="status" value="available" />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button className="rounded-md border border-line bg-white px-2.5 py-1.5 text-sm font-semibold">다시 판매</button>
        </form>
      )}
      <form
        action={`/api/admin/vehicles/${id}/ops`}
        method="post"
        onSubmit={(event) => {
          if (!window.confirm(`${stockNo} 매물을 삭제할까요? 사진과 함께 목록에서 사라집니다.`)) event.preventDefault();
        }}
      >
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-[#9f1239]">삭제</button>
      </form>
    </div>
  );
}
