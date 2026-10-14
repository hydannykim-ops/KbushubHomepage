import { eyebrow } from "@/lib/ui";

export function PageIntro({
  kicker,
  title,
  lead,
}: {
  kicker?: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="max-w-2xl">
      {kicker ? <p className={eyebrow}>{kicker}</p> : null}
      <h1 className={`${kicker ? "mt-3" : ""} text-4xl font-semibold tracking-[-0.035em] text-ink md:text-5xl md:leading-[1.08]`}>
        {title}
      </h1>
      {lead ? <p className="mt-4 text-base leading-7 text-muted">{lead}</p> : null}
    </header>
  );
}
