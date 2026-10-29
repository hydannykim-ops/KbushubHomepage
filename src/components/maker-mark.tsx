"use client";

import { useState } from "react";
import { makerLogo, makerMark } from "@/lib/domain/maker-marks";
import { isBusMaker } from "@/lib/domain/vehicle-catalog";

export function MakerMark({ maker, active = false }: { maker: string; active?: boolean }) {
  const src = makerLogo(maker);
  const [failed, setFailed] = useState(false);
  const letter = makerMark(maker);

  return (
    <span
      aria-hidden
      title={isBusMaker(maker) ? maker : undefined}
      className={[
        "inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border",
        active ? "border-ink bg-white" : "border-[#d5dae3] bg-white",
      ].join(" ")}
      data-maker-mark={maker}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-[1.15rem] w-[1.15rem] object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={["text-[11px] font-bold", active ? "text-ink" : "text-muted"].join(" ")}>{letter}</span>
      )}
    </span>
  );
}
