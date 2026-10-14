import Link from "next/link";
import { getRepository } from "@/lib/data/repository";
import { statusLabel } from "@/lib/labels";

export default async function AdminVehiclesPage() {
  const vehicles = await getRepository().listAdminVehicles();
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">매물 관리</h1>
        <Link href="/admin/vehicles/new" className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white">
          매물 등록
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-3 py-2">매물번호</th>
              <th className="px-3 py-2">모델</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">국내가</th>
              <th className="px-3 py-2">수출가</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-b border-line">
                <td className="px-3 py-2">
                  <Link href={`/admin/vehicles/${vehicle.id}`} className="text-primary">
                    {vehicle.stockNo}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {vehicle.maker} {vehicle.model}
                </td>
                <td className="px-3 py-2">{statusLabel(vehicle.status, "ko")}</td>
                <td className="px-3 py-2">{vehicle.domesticPriceKrw ?? "가격 문의"}</td>
                <td className="px-3 py-2">{vehicle.exportPriceAmount != null ? `${vehicle.exportPriceAmount} ${vehicle.exportPriceCurrency}` : "가격 문의"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
