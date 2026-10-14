import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { vehicleTitle } from "@/lib/domain";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { adminGate } from "@/lib/store";
import { btnSecondary } from "@/lib/ui";

export default async function AdminVehicles({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const gate = await adminGate();
  if (!gate.ok) return null;
  const dict = getDict(lang);
  const trade = await tradeMode();
  return (
    <div>
      <Link href={hrefFor(lang, "/admin/vehicles/new", trade)} className={btnSecondary}>{dict.admin.newVehicle}</Link>
      <div className="mt-4 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">{dict.detail.stock}</th>
              <th className="px-3 py-2 font-medium">{dict.detail.model}</th>
              <th className="px-3 py-2 font-medium">{dict.admin.status}</th>
              <th className="px-3 py-2 font-medium">{dict.admin.featured}</th>
            </tr>
          </thead>
          <tbody>
            {gate.db.vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-b border-line">
                <td className="px-3 py-3 font-mono text-xs">
                  <Link className="text-blue" href={hrefFor(lang, `/admin/vehicles/${vehicle.id}`, trade)}>{vehicle.id}</Link>
                </td>
                <td className="px-3 py-3">{vehicleTitle(vehicle, lang)}</td>
                <td className="px-3 py-3"><StatusBadge status={vehicle.status} lang={lang} /></td>
                <td className="px-3 py-3">{vehicle.featured ? dict.common.yes : dict.common.no}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
