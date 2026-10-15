import { makerMark } from "@/lib/domain/maker-marks";

export function MakerMark({ maker, active = false }: { maker: string; active?: boolean }) {
  return (
    <span
      aria-hidden
      className={[
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tracking-wide",
        active ? "bg-ink text-white" : "bg-[#e4e8ef] text-ink",
      ].join(" ")}
    >
      {makerMark(maker)}
    </span>
  );
}
