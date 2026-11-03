"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDeleteButton } from "@/components/admin/delete-button";
import { notifyAdminSaved } from "@/components/admin/saved-toast";
import type { InquiryStatus } from "@/lib/domain/types";
import { inquiryStatusLabel } from "@/lib/labels";

const statuses: InquiryStatus[] = ["new", "consulting", "quoted", "negotiating", "contracted", "closed"];

export function InquiryQuickActions({
  inquiryId,
  status,
  name,
  staffMemo,
  closeReason,
  assignedAgentId,
}: {
  inquiryId: string;
  status: InquiryStatus;
  name: string;
  staffMemo: string | null;
  closeReason: string | null;
  assignedAgentId: string | null;
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
          const next = event.target.value as InquiryStatus;
          const previous = value;
          setValue(next);
          setPending(true);
          try {
            const response = await fetch(`/api/admin/inquiries/${encodeURIComponent(inquiryId)}`, {
              method: "PATCH",
              headers: { "content-type": "application/json", accept: "application/json" },
              body: JSON.stringify({
                status: next,
                staffMemo: staffMemo ?? "",
                closeReason: next === "closed" ? closeReason || "목록에서 종료" : closeReason ?? "",
                assignedAgentId: assignedAgentId ?? "",
                assignmentReason: "",
              }),
            });
            const data = (await response.json()) as { ok?: boolean; code?: string };
            if (!response.ok || !data.ok) {
              setValue(previous);
              window.alert(
                data.code === "reason_required"
                  ? "담당 변경이 필요해 목록에서 바꾸지 못했습니다. 상세에서 수정해 주세요."
                  : data.code === "close_reason_required"
                    ? "종료 사유가 필요합니다. 상세에서 수정해 주세요."
                    : "상태를 바꾸지 못했습니다.",
              );
              return;
            }
            notifyAdminSaved(`${inquiryStatusLabel(next, "ko")}(으)로 변경했습니다.`);
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
            {inquiryStatusLabel(item, "ko")}
          </option>
        ))}
      </select>
      <AdminDeleteButton
        action={`/api/admin/inquiries/${encodeURIComponent(inquiryId)}`}
        confirmMessage={`${name} 문의를 삭제할까요? 채팅·견적 이력도 함께 삭제됩니다.`}
      />
    </div>
  );
}
