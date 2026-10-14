import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentForm } from "@/components/lead-forms";
import { PageIntro } from "@/components/page-intro";
import { DEMO_AGENT_EMAIL, DEMO_AGENT_PASSWORD, isLiveMode } from "@/lib/demo-accounts";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { panel } from "@/lib/ui";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(lang).partners.title, description: getDict(lang).partners.lead };
}

export default async function PartnersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const trade = await tradeMode();
  const dict = getDict(raw);
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <PageIntro title={dict.partners.title} lead={dict.partners.lead} />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <section className={`${panel} p-6`}>
          <h2 className="text-xl font-semibold tracking-[-0.02em]">{dict.partners.can}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{dict.partners.canBody}</p>
        </section>
        <section className={`${panel} p-6`}>
          <h2 className="text-xl font-semibold tracking-[-0.02em]">{dict.partners.cannot}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{dict.partners.cannotBody}</p>
        </section>
      </div>
      <p className="mt-6 max-w-3xl text-sm leading-6">{dict.partners.fee}</p>
      {!isLiveMode() ? (
        <p className={`${panel} mt-4 px-4 py-3 text-sm`}>
          {dict.partners.demoLogin}: {DEMO_AGENT_EMAIL} / {DEMO_AGENT_PASSWORD} ·{" "}
          <Link className="font-semibold text-blue" href={hrefFor(raw, "/agent/login", trade)}>{dict.agent.login}</Link>
        </p>
      ) : null}
      <div className={`${panel} mt-8 max-w-3xl p-5 md:p-8`}>
        <h2 className="text-xl font-semibold">{dict.partners.apply}</h2>
        <div className="mt-5">
          <AgentForm lang={raw} />
        </div>
      </div>
    </div>
  );
}
