import Link from "next/link";
import { PatchForm } from "@/components/admin/patch-form";
import { getRepository } from "@/lib/data/repository";

export default async function RequestsPage() {
  const requests = await getRepository().listRequests();
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">차량 요청·매입 상담</h1>
      <p className="text-sm text-muted">
        여기에는 홈의 <strong className="font-semibold text-ink">원하는 차량 요청</strong>과 게스트{" "}
        <strong className="font-semibold text-ink">매입 상담</strong>만 모입니다. 로그인 딜러가 올린 매물은{" "}
        <Link href="/admin/vehicles?status=review" className="font-semibold text-primary underline">
          매물 관리 → 검토 중
        </Link>
        을 보세요.
      </p>
      {requests.length ? (
        requests.map((request) => (
          <article key={request.id} className="rounded-lg border border-line bg-white p-4 text-sm">
            <p className="font-semibold">
              {request.type === "sell" ? "매입" : "요청"} · {request.model} · {request.status}
            </p>
            <p>
              {request.name} · {request.email ?? "-"} · {request.phone ?? "-"}
            </p>
            <p>연식 {request.modelYear ?? "-"} / 주행 {request.mileageKm ?? "-"} / 인승 {request.seats ?? "-"} / 대수 {request.quantity ?? "-"}</p>
            <p>예산 {request.budgetAmount ?? "-"} {request.budgetCurrency ?? ""}</p>
            <p>희망가 {request.askingPriceAmount ?? "-"} {request.askingPriceCurrency ?? ""}</p>
            <p>위치 {request.location ?? "-"} / 구매 희망 국가 {request.destinationCountry ?? "-"} / 시기 {request.desiredTime ?? "-"}</p>
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
            <div className="mt-3">
              <PatchForm action={`/api/admin/requests/${request.id}`}>
                <select name="status" defaultValue={request.status} className="rounded-md border border-line px-2 py-2">
                  <option value="new">신규</option>
                  <option value="consulting">상담 중</option>
                  <option value="closed">종료</option>
                </select>
                <textarea name="staffMemo" defaultValue={request.staffMemo ?? ""} rows={2} className="rounded-md border border-line px-2 py-2" />
              </PatchForm>
            </div>
          </article>
        ))
      ) : (
        <p className="text-sm text-muted">접수된 요청이 없습니다.</p>
      )}
    </div>
  );
}
