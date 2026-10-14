import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { btnPrimary, panel } from "@/lib/ui";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(lang).guide.title, description: getDict(lang).guide.lead };
}

export default async function GuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const trade = await tradeMode();
  const dict = getDict(raw);
  const groups = [
    { title: dict.home.domestic, steps: dict.home.domesticSteps },
    { title: dict.home.export, steps: dict.home.exportSteps },
  ];
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <PageIntro title={dict.guide.title} lead={dict.guide.lead} />
      <p className={`${panel} mt-8 px-5 py-4 text-sm leading-6`}>{dict.guide.freight}</p>
      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">{group.title}</h2>
            <ol className="mt-6 border-l border-line">
              {group.steps.map((step, index) => (
                <li key={step.title} className="py-4 pl-6">
                  <p className="font-mono text-[11px] tracking-[0.16em] text-blue">{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-1 font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <Link href={hrefFor(raw, "/inquiry", trade)} className={`${btnPrimary} mt-8`}>{dict.guide.contact}</Link>
    </div>
  );
}
