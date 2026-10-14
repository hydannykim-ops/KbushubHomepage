import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { adminGate } from "@/lib/store";

export default async function InquiriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const gate = await adminGate();
  if (!gate.ok) return null;
  const dict = getDict(lang);
  const trade = await tradeMode();
  if (!gate.db.inquiries.length) return <p className="text-sm text-muted">{dict.admin.empty}</p>;
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>
            <th className="px-3 py-2 font-medium">ID</th>
            <th className="px-3 py-2 font-medium">{dict.detail.name}</th>
            <th className="px-3 py-2 font-medium">{dict.detail.stock}</th>
            <th className="px-3 py-2 font-medium">{dict.admin.status}</th>
            <th className="px-3 py-2 font-medium">{dict.admin.firstTouch}</th>
          </tr>
        </thead>
        <tbody>
          {gate.db.inquiries.map((inquiry) => (
            <tr key={inquiry.id} className="border-b border-line">
              <td className="px-3 py-3 font-mono text-xs"><Link className="text-blue" href={hrefFor(lang, `/admin/inquiries/${inquiry.id}`, trade)}>{inquiry.id}</Link></td>
              <td className="px-3 py-3">{inquiry.name}</td>
              <td className="px-3 py-3">{inquiry.vehicleId || dict.admin.none}</td>
              <td className="px-3 py-3">{dict.inquiryStatus[inquiry.status]}</td>
              <td className="px-3 py-3 font-mono text-xs">{inquiry.referralCode || dict.admin.none}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
