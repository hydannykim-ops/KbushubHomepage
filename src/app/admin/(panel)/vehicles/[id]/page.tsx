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
  const realPhotos = vehicle.photos.filter((photo) => !photo.placeholder);
  const placeholders = vehicle.photos.filter((photo) => photo.placeholder);

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
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-bold">사진</h2>
            <p className="mt-1 text-sm text-muted">
              판매자·관리자가 올린 파일을 여기서 확인합니다. 검토 중 매물도 관리자 로그인 상태로 볼 수 있습니다.
            </p>
          </div>
          <p className="text-sm tabular-nums text-muted">
            실사진 {realPhotos.length} · 플레이스홀더 {placeholders.length}
          </p>
        </div>

        {realPhotos.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {realPhotos.map((photo) => (
              <figure key={photo.id} className="overflow-hidden border border-line bg-[#f3f5f8]">
                <a href={`/api/media/photo/${photo.id}`} target="_blank" rel="noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/media/photo/${photo.id}`}
                    alt={photo.altKo || photo.altEn || photoLabel(photo.category, "ko")}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </a>
                <figcaption className="flex items-center justify-between gap-2 border-t border-line bg-white px-3 py-2 text-xs">
                  <span className="font-semibold text-ink">
                    {photoLabel(photo.category, "ko")}
                    {photo.isCover ? " · 대표" : ""}
                  </span>
                  <a href={`/api/media/photo/${photo.id}`} target="_blank" rel="noreferrer" className="text-primary">
                    원본
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-line px-3 py-8 text-center text-sm text-muted">
            아직 업로드된 실사진이 없습니다.
          </p>
        )}

        <form
          action={`/api/admin/vehicles/${vehicle.id}/photos`}
          method="post"
          encType="multipart/form-data"
          className="mt-5 grid gap-2 border-t border-line pt-4 md:grid-cols-4"
        >
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
            <form
              key={photo.id}
              action={`/api/admin/vehicles/${vehicle.id}/photos`}
              method="post"
              className="grid items-center gap-2 rounded-md border border-line p-3 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto]"
            >
              <input type="hidden" name="photoId" value={photo.id} />
              <input type="hidden" name="update" value="1" />
              {photo.placeholder ? (
                <div className="flex aspect-square items-center justify-center bg-[#eef1f5] text-[10px] text-muted">없음</div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/media/photo/${photo.id}`}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
              )}
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
