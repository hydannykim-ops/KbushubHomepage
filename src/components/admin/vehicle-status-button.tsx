"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifyAdminSaved } from "@/components/admin/saved-toast";
import type { SaleStatus } from "@/lib/domain/types";

export function VehicleStatusButton({
  vehicleId,
  status,
  label,
  className = "rounded-md border border-line px-2 py-1 text-xs font-semibold text-ink hover:bg-[#f3f5f8] disabled:opacity-60",
}: {
  vehicleId: string;
  status: SaleStatus;
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <button
        type="button"
        disabled={pending}
        className={className}
        onClick={async () => {
          setPending(true);
          setError(null);
          try {
            const response = await fetch(`/api/admin/vehicles/${encodeURIComponent(vehicleId)}/status`, {
              method: "POST",
              headers: { "content-type": "application/json", accept: "application/json" },
              body: JSON.stringify({ status }),
            });
            const data = (await response.json()) as { ok?: boolean; code?: string };
            if (!response.ok || !data.ok) {
              setError(data.code || "save_failed");
              return;
            }
            notifyAdminSaved("상태를 변경했습니다.");
            router.refresh();
          } catch {
            setError("save_failed");
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? "처리 중…" : label}
      </button>
      {error ? <span className="text-[11px] text-[#9f1239]">{error}</span> : null}
    </span>
  );
}
