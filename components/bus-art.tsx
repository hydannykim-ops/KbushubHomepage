export function BusArt({
  variant,
  label,
}: {
  variant: "county" | "medium" | "large" | "generic";
  label: string;
}) {
  const width = variant === "county" ? 168 : variant === "medium" ? 214 : variant === "large" ? 260 : 214;
  return (
    <div className="flex h-full min-h-52 flex-col items-center justify-center bg-[#e7edf3] px-6 py-8">
      <svg viewBox="0 0 320 128" className="h-36 w-full max-w-xs" role="img" aria-label={label}>
        <g transform={`translate(${(320 - width) / 2} 16)`}>
          <path d={`M18 78 V46 H${width - 28} L${width - 8} 62 V78 Z`} fill="#f7f9fb" stroke="#10243f" strokeWidth="2" />
          <rect x="28" y="52" width={Math.max(48, width * 0.46)} height="16" fill="#d5dde6" />
          <rect x={width - 58} y="50" width="28" height="28" fill="none" stroke="#10243f" strokeWidth="2" />
          <circle cx="52" cy="80" r="13" fill="#10243f" />
          <circle cx={width - 46} cy="80" r="13" fill="#10243f" />
          <circle cx="52" cy="80" r="5" fill="#f3f5f7" />
          <circle cx={width - 46} cy="80" r="5" fill="#f3f5f7" />
        </g>
      </svg>
      <p className="mt-2 text-center text-xs font-medium tracking-wide text-muted">{label}</p>
    </div>
  );
}
