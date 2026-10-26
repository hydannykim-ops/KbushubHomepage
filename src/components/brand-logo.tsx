import Image from "next/image";

type BrandLogoProps = {
  /** Compact header mark vs larger lockup. */
  size?: "sm" | "md";
  className?: string;
  priority?: boolean;
};

const sizes = {
  sm: { width: 44, height: 44, className: "h-10 w-10" },
  md: { width: 56, height: 56, className: "h-12 w-12" },
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

export function BrandWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`leading-none ${className}`}>
      <span className="block text-[11px] font-semibold tracking-[0.18em] text-muted">K-BUS</span>
      <span className="block text-lg font-semibold leading-none tracking-wide text-ink">HUB</span>
    </span>
  );
}
