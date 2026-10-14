import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { adminGate } from "@/lib/store";

export default async function LeadsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const gate = await adminGate();
  if (!gate.ok) return null;
  const dict = getDict(lang);
  const requests = gate.db.leads.filter((lead) => lead.type === "request");
  const sells = gate.db.leads.filter((lead) => lead.type === "sell");
  return (
    <div className="grid gap-8">
      <section>
        <h2 className="text-lg font-semibold">{dict.admin.requests}</h2>
        {requests.length ? (
          <ul className="mt-3 grid gap-3">
            {requests.map((lead) => (
              <li key={lead.id} className="border border-line bg-white p-4 text-sm">
                <p className="font-mono text-xs">{lead.id}</p>
                <p className="mt-1">{lead.model} · {lead.quantity} · {lead.country}</p>
                <p>{lead.contactName} · {lead.contact}</p>
                <p className="text-muted">{lead.budgetAmount ?? dict.common.unknown} {lead.budgetCurrency}</p>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-muted">{dict.admin.empty}</p>}
      </section>
      <section>
        <h2 className="text-lg font-semibold">{dict.admin.sells}</h2>
        {sells.length ? (
          <ul className="mt-3 grid gap-3">
            {sells.map((lead) => (
              <li key={lead.id} className="border border-line bg-white p-4 text-sm">
                <p className="font-mono text-xs">{lead.id}</p>
                <p className="mt-1">{lead.model} · {lead.location}</p>
                <p>{lead.contactName} · {lead.contact}</p>
                <ul className="mt-2 text-xs">
                  {lead.photos.map((photo) => (
                    <li key={photo.storedAs}>
                      <a className="text-blue" href={`/api/lead-photo/${lead.id}/${photo.storedAs}`}>{photo.name}</a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-muted">{dict.admin.empty}</p>}
      </section>
    </div>
  );
}
