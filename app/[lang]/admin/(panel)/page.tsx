import { adminGate } from "@/lib/store";
import { getDict, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function AdminHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const gate = await adminGate();
  if (!gate.ok) return null;
  const dict = getDict(lang);
  const cards = [
    [dict.admin.available, gate.db.vehicles.filter((vehicle) => vehicle.status === "available").length],
    [dict.admin.newInquiries, gate.db.inquiries.filter((inquiry) => inquiry.status === "new").length],
    [dict.admin.pendingAgents, gate.db.agents.filter((agent) => agent.status === "pending").length],
    [dict.admin.openQuotes, gate.db.quotes.length],
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([label, value]) => (
        <section key={String(label)} className="border border-line bg-white p-5">
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
        </section>
      ))}
    </div>
  );
}
