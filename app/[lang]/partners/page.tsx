import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentForm } from "@/components/lead-forms";
import { DEMO_AGENT_EMAIL, DEMO_AGENT_PASSWORD, isLiveMode } from "@/lib/demo-accounts";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";

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
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.partners.title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{dict.partners.lead}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="border border-line bg-white p-5">
          <h2 className="font-semibold">{dict.partners.can}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{dict.partners.canBody}</p>
        </section>
        <section className="border border-line bg-white p-5">
          <h2 className="font-semibold">{dict.partners.cannot}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{dict.partners.cannotBody}</p>
        </section>
      </div>
      <p className="mt-4 text-sm leading-6">{dict.partners.fee}</p>
      {!isLiveMode() ? (
        <p className="mt-4 border border-line bg-white px-4 py-3 text-sm">
          {dict.partners.demoLogin}: {DEMO_AGENT_EMAIL} / {DEMO_AGENT_PASSWORD} ·{" "}
          <Link className="font-semibold text-blue" href={hrefFor(raw, "/agent/login", trade)}>{dict.agent.login}</Link>
        </p>
      ) : null}
      <div className="mt-8 max-w-3xl border border-line bg-white p-5 md:p-6">
        <h2 className="text-xl font-semibold">{dict.partners.apply}</h2>
        <div className="mt-5">
          <AgentForm lang={raw} />
        </div>
      </div>
    </div>
  );
}
