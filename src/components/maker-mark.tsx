import type { BusMaker } from "@/lib/domain/vehicle-catalog";
import { isBusMaker } from "@/lib/domain/vehicle-catalog";

function Icon({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      aria-hidden
      className={[
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
        active ? "bg-ink text-white" : "bg-[#dde2ea] text-ink",
      ].join(" ")}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        {children}
      </svg>
    </span>
  );
}

function MarkGlyph({ maker, active }: { maker: BusMaker; active?: boolean }) {
  switch (maker) {
    case "현대":
      return (
        <Icon active={active}>
          <ellipse cx="12" cy="12" rx="8" ry="5.5" />
          <path d="M8 12h8M12 8.5v7" />
        </Icon>
      );
    case "기아":
      return (
        <Icon active={active}>
          <path d="M5 16V8l5 8 5-8v8" strokeLinecap="round" strokeLinejoin="round" />
        </Icon>
      );
    case "대우":
      return (
        <Icon active={active}>
          <circle cx="12" cy="12" r="7" />
          <path d="M9 15V9h3.2a2.2 2.2 0 010 4.4H9" strokeLinecap="round" strokeLinejoin="round" />
        </Icon>
      );
    case "벤츠":
      return (
        <Icon active={active}>
          <circle cx="12" cy="12" r="7.5" />
          <path d="M12 5.5v6.5M12 12l5.5 4M12 12l-5.5 4" strokeLinecap="round" />
        </Icon>
      );
    case "선롱버스":
      return (
        <Icon active={active}>
          <path d="M6 16V9.5A2.5 2.5 0 018.5 7H16l2 2.5V16" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 16h10M9.5 13.5h1M15 13.5h1" strokeLinecap="round" />
        </Icon>
      );
    case "수입버스":
      return (
        <Icon active={active}>
          <circle cx="12" cy="12" r="7.5" />
          <path d="M5.5 12h13M12 5.5c2.2 2.2 3.3 4.4 3.3 6.5S14.2 16.3 12 18.5c-2.2-2.2-3.3-4.4-3.3-6.5S9.8 7.7 12 5.5z" />
        </Icon>
      );
    default:
      return (
        <Icon active={active}>
          <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
        </Icon>
      );
  }
}

export function MakerMark({ maker, active = false }: { maker: string; active?: boolean }) {
  if (!isBusMaker(maker)) {
    return (
      <Icon active={active}>
        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      </Icon>
    );
  }
  return <MarkGlyph maker={maker} active={active} />;
}
