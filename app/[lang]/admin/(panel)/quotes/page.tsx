import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney, quoteTotal } from "@/lib/domain";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { adminGate } from "@/lib/store";

export default async function QuotesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const gate = await adminGate();
  if (!gate.ok) return null;
  const dict = getDict(lang);
  const trade = await tradeMode();
  if (!gate.db.quotes.length) return <p className="text-sm text-muted">{dict.admin.empty}</p>;
  return (
    <ul className="grid gap-3">
      {gate.db.quotes.map((quote) => {
        const total = quoteTotal(quote);
        return (
          <li key={quote.id} className="border border-line bg-white p-4 text-sm">
            <p className="font-mono text-xs">{quote.id} · v{quote.version}</p>
            <p className="mt-2">
              <Link className="text-blue" href={hrefFor(lang, `/admin/inquiries/${quote.inquiryId}`, trade)}>{quote.inquiryId}</Link>
              {" · "}{quote.vehicleId || dict.admin.none}
            </p>
            <p className="mt-2">
              {total.state === "complete"
                ? `${dict.admin.total}: ${formatMoney(total.total, quote.currency, lang)}`
                : dict.admin.incomplete}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
