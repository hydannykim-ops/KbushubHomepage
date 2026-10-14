import { notFound } from "next/navigation";
import { createQuote, updateInquiry } from "@/lib/actions";
import { formatMoney, quoteTotal } from "@/lib/domain";
import { getDict, isLocale } from "@/lib/i18n";
import { adminGate } from "@/lib/store";
import { btnPrimary, fieldClass, areaClass } from "@/lib/ui";

export default async function InquiryDetail({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const gate = await adminGate();
  if (!gate.ok) return null;
  const inquiry = gate.db.inquiries.find((item) => item.id === id);
  if (!inquiry) notFound();
  const dict = getDict(lang);
  const quotes = gate.db.quotes.filter((quote) => quote.inquiryId === inquiry.id);
  const statuses = ["new", "consulting", "quoted", "negotiating", "contract", "closed"] as const;
  return (
    <div className="grid gap-6">
      <section className="border border-line bg-white p-5 text-sm leading-7">
        <h2 className="text-xl font-semibold">{inquiry.id}</h2>
        <p className="mt-3">{inquiry.name} · {inquiry.contact}</p>
        <p>{dict.trade[inquiry.trade]} · {dict.kind[inquiry.kind]} · {inquiry.country}</p>
        <p>{dict.detail.stock}: {inquiry.vehicleId || dict.admin.none}</p>
        <p>{dict.detail.destination}: {inquiry.destinationCountry || dict.admin.none}</p>
        <p>{dict.detail.port}: {inquiry.portUndecided ? dict.detail.portUndecided : inquiry.destinationPort || dict.admin.none}</p>
        <p className="mt-2 whitespace-pre-wrap">{inquiry.message}</p>
        <p className="mt-3 font-mono text-xs">{dict.admin.firstTouch}: {inquiry.referralCode || dict.admin.none}</p>
        <p className="font-mono text-xs">{dict.admin.assigned}: {inquiry.assignedAgentId || dict.admin.none}</p>
      </section>
      <form action={updateInquiry} className="grid gap-3 border border-line bg-white p-5">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="id" value={inquiry.id} />
        <label className="grid gap-1.5 text-sm font-medium">{dict.admin.status}
          <select name="status" defaultValue={inquiry.status} className={fieldClass}>
            {statuses.map((status) => <option key={status} value={status}>{dict.inquiryStatus[status]}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.admin.assign}
          <select name="assignedAgentId" defaultValue={inquiry.assignedAgentId || ""} className={fieldClass}>
            <option value="">{dict.admin.none}</option>
            {gate.db.agents.filter((agent) => agent.status === "approved").map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name} · {agent.code}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.admin.reason}<input name="reason" className={fieldClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.admin.note}<textarea name="staffNote" defaultValue={inquiry.staffNote} className={areaClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">{dict.admin.closeReason}<input name="closeReason" defaultValue={inquiry.closeReason} className={fieldClass} /></label>
        <button className={btnPrimary}>{dict.admin.save}</button>
      </form>
      <section>
        <h2 className="font-semibold">{dict.admin.history}</h2>
        {inquiry.referralHistory.length ? (
          <ul className="mt-2 grid gap-2 text-sm">
            {inquiry.referralHistory.map((item) => (
              <li key={item.at} className="border border-line bg-white px-3 py-2">
                {item.at} · {item.fromAgentId || dict.admin.none} → {item.toAgentId || dict.admin.none} · {item.reason}
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-muted">{dict.admin.empty}</p>}
      </section>
      <section className="border border-line bg-white p-5">
        <h2 className="font-semibold">{dict.admin.createQuote}</h2>
        <p className="mt-1 text-xs text-muted">{dict.admin.blankNull}</p>
        <form action={createQuote} className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="inquiryId" value={inquiry.id} />
          {([
            ["vehiclePrice", dict.admin.vehiclePrice],
            ["domesticTransport", dict.admin.domesticTransport],
            ["exportCosts", dict.admin.exportCosts],
            ["oceanFreight", dict.admin.ocean],
            ["otherCosts", dict.admin.other],
          ] as const).map(([name, label]) => (
            <label key={name} className="grid gap-1.5 text-sm font-medium">{label}<input name={name} className={fieldClass} /></label>
          ))}
          <label className="grid gap-1.5 text-sm font-medium">{dict.admin.currency}
            <select name="currency" defaultValue="USD" className={fieldClass}><option>USD</option><option>EUR</option><option>KRW</option></select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">{dict.admin.validUntil}<input type="date" name="validUntil" className={fieldClass} /></label>
          <label className="grid gap-1.5 text-sm font-medium md:col-span-2">{dict.admin.included}<input name="included" className={fieldClass} /></label>
          <label className="grid gap-1.5 text-sm font-medium md:col-span-2">{dict.admin.excluded}<input name="excluded" className={fieldClass} /></label>
          <label className="grid gap-1.5 text-sm font-medium md:col-span-2">{dict.admin.terms}<input name="terms" className={fieldClass} /></label>
          <button className={btnPrimary}>{dict.admin.createQuote}</button>
        </form>
        <ul className="mt-6 grid gap-3">
          {quotes.map((quote) => {
            const total = quoteTotal(quote);
            return (
              <li key={quote.id} className="border border-line p-3 text-sm">
                <p className="font-mono text-xs">{quote.id} · {dict.admin.version} {quote.version} · {quote.currency}</p>
                <p className="mt-2">{dict.admin.vehiclePrice}: {quote.vehiclePrice == null ? dict.common.unknown : formatMoney(quote.vehiclePrice, quote.currency, lang)}</p>
                <p>{dict.admin.ocean}: {quote.oceanFreight == null ? dict.common.unknown : formatMoney(quote.oceanFreight, quote.currency, lang)}</p>
                {total.state === "complete" ? (
                  <p className="mt-2 font-semibold">{dict.admin.total}: {formatMoney(total.total, quote.currency, lang)}</p>
                ) : (
                  <p className="mt-2">{dict.admin.incomplete}</p>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
