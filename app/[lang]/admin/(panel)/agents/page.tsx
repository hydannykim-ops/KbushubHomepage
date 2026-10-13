import { notFound } from "next/navigation";
import { setAgentStatus } from "@/lib/actions";
import { getDict, isLocale } from "@/lib/i18n";
import { adminGate } from "@/lib/store";
import { btnSmall } from "@/lib/ui";

export default async function AgentsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const gate = await adminGate();
  if (!gate.ok) return null;
  const dict = getDict(lang);
  return (
    <ul className="grid gap-3">
      {gate.db.agents.map((agent) => (
        <li key={agent.id} className="border border-line bg-white p-4 text-sm">
          <p className="font-semibold">{agent.name} · {agent.company}</p>
          <p className="mt-1 text-muted">{agent.email} · {agent.country} · {agent.status}</p>
          <p className="mt-1 font-mono text-xs">{dict.admin.code}: {agent.code}</p>
          <div className="mt-3 flex gap-2">
            <form action={setAgentStatus}>
              <input type="hidden" name="id" value={agent.id} />
              <input type="hidden" name="status" value="approved" />
              <button className={btnSmall}>{dict.admin.approve}</button>
            </form>
            <form action={setAgentStatus}>
              <input type="hidden" name="id" value={agent.id} />
              <input type="hidden" name="status" value="rejected" />
              <button className={btnSmall}>{dict.admin.reject}</button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
