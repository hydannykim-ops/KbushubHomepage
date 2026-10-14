export function PhotoFrame({
  kicker,
  caption,
  fill = false,
  aspect = "aspect-[3/2]",
}: {
  kicker: string;
  caption: string;
  fill?: boolean;
  aspect?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${kicker}. ${caption}`}
      className={`relative overflow-hidden bg-[#e7e1d6] text-ink ${fill ? "absolute inset-0 h-full w-full" : aspect}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(20,24,31,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,24,31,0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <span aria-hidden="true" className="absolute left-3.5 top-3.5 h-3.5 w-3.5 border-l border-t border-ink/35" />
      <span aria-hidden="true" className="absolute right-3.5 top-3.5 h-3.5 w-3.5 border-r border-t border-ink/35" />
      <span aria-hidden="true" className="absolute bottom-3.5 left-3.5 h-3.5 w-3.5 border-b border-l border-ink/35" />
      <span aria-hidden="true" className="absolute bottom-3.5 right-3.5 h-3.5 w-3.5 border-b border-r border-ink/35" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-[11px] font-medium tracking-[0.28em] text-ink/65">{kicker}</p>
        <p className="mt-3 max-w-sm text-sm leading-6 text-ink/55">{caption}</p>
      </div>
    </div>
  );
}
