"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDeleteButton } from "@/components/admin/delete-button";
import { notifyAdminSaved } from "@/components/admin/saved-toast";
import type { RequestStatus, RequestType } from "@/lib/domain/types";

const statuses: RequestStatus[] = ["new", "consulting", "closed"];

const statusLabel: Record<RequestStatus, string> = {
  new: "신규",
  consulting: "상담 중",
  closed: "종료",
};

const typeLabel: Record<RequestType, string> = {
  wanted: "요청",
  sell: "매입",
  scrap: "폐차",
};

export function RequestQuickActions({
  requestId,
  status,
  type,
  name,
  staffMemo,
}: {
  requestId: string;
  status: RequestStatus;
  type: RequestType;
  name: string;
  staffMemo: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, setPending] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <select
        value={value}
        disabled={pending}
        className="rounded-md border border-line px-2 py-1 text-xs"
        onChange={async (event) => {
          const next = event.target.value as RequestStatus;
          const previous = value;
          setValue(next);
          setPending(true);
          try {
            const response = await fetch(`/api/admin/requests/${encodeURIComponent(requestId)}`, {
              method: "PATCH",
              headers: { "content-type": "application/json", accept: "application/json" },
              body: JSON.stringify({
                status: next,
                staffMemo: staffMemo ?? "",
              }),
            });
            const data = (await response.json()) as { ok?: boolean };
            if (!response.ok || !data.ok) {
              setValue(previous);
              window.alert("상태를 바꾸지 못했습니다.");
              return;
            }
            notifyAdminSaved(`${statusLabel[next]}(으)로 변경했습니다.`);
            router.refresh();
          } catch {
            setValue(previous);
            window.alert("상태를 바꾸지 못했습니다.");
          } finally {
            setPending(false);
          }
        }}
      >
        {statuses.map((item) => (
          <option key={item} value={item}>
            {statusLabel[item]}
          </option>
        ))}
      </select>
      <AdminDeleteButton
        action={`/api/admin/requests/${encodeURIComponent(requestId)}`}
        confirmMessage={`${typeLabel[type]} 접수(${name})를 삭제할까요?`}
      />
    </div>
  );
}
