import Link from "next/link";
import { AdminDeleteButton } from "@/components/admin/delete-button";
import { PatchForm } from "@/components/admin/patch-form";
import { getRepository } from "@/lib/data/repository";
import type { RequestStatus, RequestType } from "@/lib/domain/types";

const typeLabel: Record<RequestType, string> = {
  wanted: "요청",
  sell: "매입",
  scrap: "폐차",
};

const statusLabelKo: Record<RequestStatus, string> = {
  new: "신규",
  consulting: "상담 중",
  closed: "종료",
};

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const type = typeof sp.type === "string" ? sp.type : "";
  const requests = (await getRepository().listRequests()).slice().sort((a, b) => {
    const rank = Number(a.status === "closed") - Number(b.status === "closed") || Number(a.status !== "new") - Number(b.status !== "new");
    if (rank !== 0) return rank;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const visible = requests.filter((request) => {
    if (status && request.status !== status) return false;
    if (type && request.type !== type) return false;
    return true;
  });

  function hrefFor(next: { status?: string; type?: string }) {
    const params = new URLSearchParams();
    const nextStatus = next.status === undefined ? status : next.status;
    const nextType = next.type === undefined ? type : next.type;
    if (nextStatus) params.set("status", nextStatus);
    if (nextType) params.set("type", nextType);
    const qs = params.toString();
    return qs ? `/admin/requests?${qs}` : "/admin/requests";
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">차량 요청·매입·폐차 상담</h1>
      <p className="text-sm text-muted">
        여기에는 홈의 <strong className="font-semibold text-ink">원하는 차량 요청</strong>, 게스트{" "}
        <strong className="font-semibold text-ink">매입 상담</strong>, <strong className="font-semibold text-ink">폐차 견적</strong>이 모입니다. 로그인 딜러가 올린 매물은{" "}
        <Link href="/admin/vehicles?status=review" className="font-semibold text-primary underline">
          매물 관리 → 검토 중
        </Link>
        을 보세요.
      </p>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={hrefFor({ status: "" })} className={!status ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
          상태 전체
        </Link>
        {(["new", "consulting", "closed"] as const).map((value) => (
          <Link key={value} href={hrefFor({ status: value })} className={status === value ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
            {statusLabelKo[value]}
          </Link>
        ))}
        <span className="text-line">|</span>
        <Link href={hrefFor({ type: "" })} className={!type ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
          유형 전체
        </Link>
        {(["wanted", "sell", "scrap"] as const).map((value) => (
          <Link key={value} href={hrefFor({ type: value })} className={type === value ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
            {typeLabel[value]}
          </Link>
        ))}
      </div>

      {visible.length ? (
        visible.map((request) => (
          <article key={request.id} className="rounded-lg border border-line bg-white p-4 text-sm">
            <p className="font-semibold">
              {typeLabel[request.type]} · {request.model}
              {request.plateNo ? ` · ${request.plateNo}` : ""} · {statusLabelKo[request.status]}
            </p>
            <p>
              {request.name} · {request.email ?? "-"} · {request.phone ?? "-"}
            </p>
            <p>
              {request.type === "wanted" ? (
                <>
                  연식 {request.modelYear != null ? `${request.modelYear} 이하` : "상관없음"}
                  {" / "}
                  인승 {request.seats != null ? `${request.seats} 이상` : "상관없음"}
                  {" / "}
                  대수 {request.quantity ?? "-"}
                </>
              ) : (
                <>
                  연식 {request.modelYear ?? "-"} / 주행 {request.mileageKm ?? "-"} / 인승 {request.seats ?? "-"} / 대수{" "}
                  {request.quantity ?? "-"}
                </>
              )}
            </p>
            <p>
              예산 {request.budgetAmount ?? "-"} {request.budgetCurrency ?? ""}
            </p>
            <p>
              희망가 {request.askingPriceAmount ?? "-"} {request.askingPriceCurrency ?? ""}
            </p>
            <p>
              위치 {request.location ?? "-"} / 목적국 {request.destinationCountry ?? "-"} / 시기 {request.desiredTime ?? "-"}
            </p>
            <p>추천 코드 {request.firstReferralCode ?? "-"}</p>
            <p className="whitespace-pre-wrap">{request.message}</p>
            {request.files.length ? (
              <ul className="mt-2">
                {request.files.map((file) => (
                  <li key={file.id}>
                    <a className="text-primary" href={`/api/media/private/${file.id}`}>
                      {file.originalName}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-3 grid gap-2">
              <PatchForm action={`/api/admin/requests/${request.id}`}>
                <select name="status" defaultValue={request.status} className="rounded-md border border-line px-2 py-2">
                  <option value="new">신규</option>
                  <option value="consulting">상담 중</option>
                  <option value="closed">종료</option>
                </select>
                <textarea name="staffMemo" defaultValue={request.staffMemo ?? ""} rows={2} className="rounded-md border border-line px-2 py-2" />
              </PatchForm>
              <AdminDeleteButton
                action={`/api/admin/requests/${request.id}`}
                confirmMessage={`${typeLabel[request.type]} 접수(${request.name})를 삭제할까요?`}
                className="justify-self-start rounded-md border border-[#f1c4c8] px-3 py-2 text-sm font-semibold text-[#9f1239] hover:bg-[#fff1f2] disabled:opacity-60"
              />
            </div>
          </article>
        ))
      ) : (
        <p className="text-sm text-muted">조건에 맞는 요청이 없습니다.</p>
      )}
    </div>
  );
}
