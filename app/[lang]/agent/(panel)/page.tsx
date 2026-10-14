import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CopyLink } from "@/components/copy-link";
import { logout } from "@/lib/actions";
import { DataProblem } from "@/components/data-problem";
import { toAgentInquiryView, vehicleTitle } from "@/lib/domain";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor, siteUrl } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { agentGate } from "@/lib/store";
import { btnSmall } from "@/lib/ui";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AgentHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) redirect("/ko/agent/login");
  const gate = await agentGate();
  if (!gate.ok && gate.reason === "auth") redirect(`/${lang}/agent/login`);
  if (!gate.ok) return <DataProblem lang={lang} reason={gate.reason} />;
  const dict = getDict(lang);
  const trade = await tradeMode();
  const rows = gate.db.inquiries
    .filter((inquiry) => inquiry.referralCode === gate.agent.code)
    .map(toAgentInquiryView);
  const vehicles = gate.db.vehicles.filter((vehicle) => vehicle.status !== "hidden").map((vehicle) => ({
    id: vehicle.id,
    title: vehicleTitle(vehicle, lang),
    href: `${siteUrl()}${hrefFor(lang, `/inventory/${vehicle.id}`, trade, { ref: gate.agent.code })}`,
  }));
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{dict.agent.title}</h1>
        <form action={logout}>
          <input type="hidden" name="lang" value={lang} />
          <button className={btnSmall}>{dict.admin.logout}</button>
        </form>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{dict.agent.lead}</p>
      <p className="mt-2 font-mono text-xs">{dict.admin.code}: {gate.agent.code}</p>
      <section className="mt-8">
        <h2 className="font-semibold">{dict.agent.share}</h2>
        <ul className="mt-3 grid gap-3">
          {vehicles.slice(0, 8).map((vehicle) => (
            <li key={vehicle.id} className="border border-line bg-white p-4 text-sm">
              <p>{vehicle.title}</p>
              <p className="font-mono text-xs text-muted">{vehicle.id}</p>
              <div className="mt-2">
                <CopyLink href={vehicle.href} label={dict.agent.copy} copied={dict.common.copied} show={dict.common.showLink} />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="font-semibold">{dict.agent.status}</h2>
        {rows.length ? (
          <ul className="mt-3 grid gap-2">
            {rows.map((row) => (
              <li key={row.id} className="border border-line bg-white px-4 py-3 text-sm">
                <span className="font-mono text-xs">{row.createdAt.slice(0, 10)}</span>
                {" · "}{row.vehicleId || dict.admin.none}
                {" · "}{dict.inquiryStatus[row.status]}
                {" · "}{dict.trade[row.trade]}
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-muted">{dict.agent.empty}</p>}
      </section>
    </div>
  );
}
