"use client";

import { useState } from "react";
import { btnSmall } from "@/lib/ui";

export function CopyLink({ href, label, copied, show }: { href: string; label: string; copied: string; show: string }) {
  const [state, setState] = useState<"idle" | "done" | "show">("idle");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={btnSmall}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(href);
            setState("done");
          } catch {
            setState("show");
          }
        }}
      >
        {state === "done" ? copied : label}
      </button>
      {state === "show" ? (
        <input aria-label={show} readOnly value={href} className="h-9 min-w-0 flex-1 border border-line px-2 text-xs" />
      ) : null}
    </div>
  );
}
