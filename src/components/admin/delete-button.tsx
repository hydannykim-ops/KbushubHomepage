"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifyAdminSaved } from "@/components/admin/saved-toast";

export function AdminDeleteButton({
  action,
  label = "삭제",
  confirmMessage,
  redirectTo,
  className = "rounded-md border border-[#f1c4c8] px-2 py-1 text-xs font-semibold text-[#9f1239] hover:bg-[#fff1f2] disabled:opacity-60",
}: {
  action: string;
  label?: string;
  confirmMessage: string;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={async () => {
        if (!window.confirm(confirmMessage)) return;
        setPending(true);
        try {
          const response = await fetch(action, { method: "DELETE", headers: { accept: "application/json" } });
          const data = (await response.json()) as { ok?: boolean; code?: string };
          if (!response.ok || !data.ok) {
            window.alert(data.code === "not_found" ? "이미 없거나 찾을 수 없습니다." : "삭제하지 못했습니다.");
            return;
          }
          notifyAdminSaved("삭제되었습니다.");
          if (redirectTo) router.push(redirectTo);
          else router.refresh();
        } catch {
          window.alert("삭제하지 못했습니다.");
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "삭제 중…" : label}
    </button>
  );
}
