export function LogoMark({ light = false }: { light?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-dashed text-[9px] font-semibold tracking-[0.18em] ${
        light ? "border-white/35 text-white/75" : "border-ink/25 bg-card text-ink/60"
      }`}
    >
      LOGO
    </span>
  );
}
