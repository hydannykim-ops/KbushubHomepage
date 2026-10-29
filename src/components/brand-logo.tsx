import Image from "next/image";

type BrandLogoProps = {
  /** Compact footer mark vs larger header mark. */
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const sizes = {
  sm: { width: 44, height: 44, className: "h-10 w-10" },
  md: { width: 56, height: 56, className: "h-12 w-12" },
  lg: { width: 88, height: 88, className: "h-14 w-14 sm:h-16 sm:w-16" },
} as const;

export function BrandLogo({ size = "sm", className = "", priority = false }: BrandLogoProps) {
  const dim = sizes[size];
  return (
    <span className={`brand-logo inline-flex shrink-0 overflow-hidden rounded-xl bg-white ${dim.className} ${className}`} data-brand-logo>
      <Image
        src="/brand/kbus-hub-logo.jpg"
        alt="K-BUS HUB"
        width={dim.width}
        height={dim.height}
        className="h-full w-full object-contain"
        priority={priority}
      />
    </span>
  );
}

/** Single-line wordmark — same layout as the footer lockup. */
export function BrandWordmark({ className = "", size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  const scale =
    size === "lg"
      ? "text-[1.35rem] font-semibold tracking-tight text-ink sm:text-[1.65rem]"
      : "text-base font-semibold tracking-tight text-ink";
  return <span className={`leading-none whitespace-nowrap ${scale} ${className}`}>K-BUS HUB</span>;
}
