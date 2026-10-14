import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/admin/editors";
import { getRepository } from "@/lib/data/repository";
import { internalProfit, formatMoney } from "@/lib/domain/money";
import { photoCategoryList, photoLabel } from "@/lib/labels";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getRepository().getAdminVehicle(id);
  if (!vehicle) notFound();
  const profit = internalProfit(vehicle.internal);
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">{vehicle.stockNo}</h1>
      {vehicle.listingSource === "dealer" ? (
        <p className="text-sm">
          판매 사업자 등록 · {vehicle.sellerCompany ?? "상호 없음"} · {vehicle.sellerName ?? "이름 없음"} · {vehicle.sellerEmail ?? "이메일 없음"}
          {vehicle.status === "review" ? " · 검토 중이라 공개 목록에 없습니다." : ""}
        </p>
      ) : null}
      <p className="text-sm">
        손익:{" "}
        {profit.status === "amount"
          ? formatMoney(profit.amount, profit.currency, "ko")
          : profit.reason === "currency"
            ? "통화가 달라 계산하지 않습니다."
            : "금액이 비어 있어 계산하지 않습니다."}
      </p>
      <div className="rounded-lg border border-line bg-white p-4">
        <VehicleForm vehicle={vehicle} />
      </div>
      <section className="rounded-lg border border-line bg-white p-4">
        <h2 className="font-bold">사진</h2>
        <form action={`/api/admin/vehicles/${vehicle.id}/photos`} method="post" encType="multipart/form-data" className="mt-3 grid gap-2 md:grid-cols-4">
          <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required className="text-sm" />
          <select name="category" className="rounded-md border border-line px-2 py-2 text-sm">
            {photoCategoryList.map((category) => (
              <option key={category} value={category}>
                {photoLabel(category, "ko")}
              </option>
            ))}
          </select>
          <input name="altKo" placeholder="한국어 설명" className="rounded-md border border-line px-2 py-2 text-sm" />
          <button className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white">업로드</button>
        </form>
        <div className="mt-4 grid gap-3">
          {vehicle.photos.map((photo) => (
            <form key={photo.id} action={`/api/admin/vehicles/${vehicle.id}/photos`} method="post" className="grid items-center gap-2 rounded-md border border-line p-3 md:grid-cols-6">
              <input type="hidden" name="photoId" value={photo.id} />
              <input type="hidden" name="update" value="1" />
              <span className="text-xs text-muted">{photo.placeholder ? "플레이스홀더" : "파일"}</span>
              <select name="category" defaultValue={photo.category} className="rounded-md border border-line px-2 py-1 text-sm">
                {photoCategoryList.map((category) => (
                  <option key={category} value={category}>
                    {photoLabel(category, "ko")}
                  </option>
                ))}
              </select>
              <input name="sortOrder" defaultValue={photo.sortOrder} className="rounded-md border border-line px-2 py-1 text-sm" />
              <label className="text-sm">
                <input type="checkbox" name="isCover" value="1" defaultChecked={photo.isCover} /> 대표
              </label>
              <button className="rounded-md border border-line px-2 py-1 text-sm">순서 저장</button>
              <button formAction={`/api/admin/vehicles/${vehicle.id}/photos`} name="delete" value="1" className="text-sm text-[#9f1239]">
                삭제
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
