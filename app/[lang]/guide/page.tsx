import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { btnPrimary } from "@/lib/ui";

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
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.guide.title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{dict.guide.lead}</p>
      <p className="mt-4 border border-line bg-white px-4 py-3 text-sm">{dict.guide.freight}</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="text-xl font-semibold">{group.title}</h2>
            <ol className="mt-4 grid gap-3">
              {group.steps.map((step, index) => (
                <li key={step.title} className="border border-line bg-white p-4">
                  <p className="font-mono text-xs text-blue">{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-2 font-semibold">{step.title}</p>
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
