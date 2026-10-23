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
    <span className={`brand-logo inline-flex shrink-0 overflow-hidden rounded-xl ${dim.className} ${className}`} data-brand-logo>
      <Image
        src="/brand/hey-bus-logo.jpg"
        alt="hey! Bus"
        width={dim.width}
        height={dim.height}
        className="h-full w-full object-cover"
        priority={priority}
      />
    </span>
  );
}

export function BrandWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`leading-none ${className}`}>
      <span className="block text-[0.95rem] font-bold tracking-tight text-ink sm:text-lg">
        <span className="text-[#ff6a2b]">hey!</span> <span className="text-ink">Bus</span>
      </span>
    </span>
  );
}
