import Link from "next/link";
import { PatchForm } from "@/components/admin/patch-form";
import { RequestQuickActions } from "@/components/admin/request-quick-actions";
import { getRepository } from "@/lib/data/repository";
import type { RequestStatus, RequestType, VehicleRequest } from "@/lib/domain/types";

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

function money(amount: number | null, currency: string | null) {
  if (amount == null) return null;
  return `${amount.toLocaleString("ko-KR")}${currency ? ` ${currency}` : ""}`;
}

function conditionSummary(request: VehicleRequest) {
  if (request.type === "wanted") {
    return [
      request.modelYear != null ? `${request.modelYear}년 이하` : "연식 무관",
      request.seats != null ? `${request.seats}인승↑` : "인승 무관",
      request.quantity != null ? `${request.quantity}대` : null,
      money(request.budgetAmount, request.budgetCurrency) ? `예산 ${money(request.budgetAmount, request.budgetCurrency)}` : null,
      request.destinationCountry ? `목적국 ${request.destinationCountry}` : null,
      request.desiredTime ? `시기 ${request.desiredTime}` : null,
    ].filter(Boolean);
  }
  if (request.type === "scrap") {
    return [
      request.plateNo ? `번호 ${request.plateNo}` : null,
      request.modelYear != null ? `${request.modelYear}년식` : null,
      request.location ? `위치 ${request.location}` : null,
    ].filter(Boolean);
  }
  return [
    request.modelYear != null ? `${request.modelYear}년식` : null,
    request.mileageKm != null ? `${request.mileageKm.toLocaleString("ko-KR")}km` : null,
    request.seats != null ? `${request.seats}인승` : null,
    money(request.askingPriceAmount, request.askingPriceCurrency)
      ? `희망 ${money(request.askingPriceAmount, request.askingPriceCurrency)}`
      : null,
    request.location ? `위치 ${request.location}` : null,
    request.destinationCountry ? `목적국 ${request.destinationCountry}` : null,
  ].filter(Boolean);
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const type = typeof sp.type === "string" ? sp.type : "";
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const requests = (await getRepository().listRequests()).slice().sort((a, b) => {
    const rank = Number(a.status === "closed") - Number(b.status === "closed") || Number(a.status !== "new") - Number(b.status !== "new");
    if (rank !== 0) return rank;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const visible = requests.filter((request) => {
    if (status && request.status !== status) return false;
    if (type && request.type !== type) return false;
    if (!q) return true;
    const haystack = [request.name, request.email, request.phone, request.model, request.plateNo, request.location, request.firstReferralCode]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  function hrefFor(next: { status?: string; type?: string; q?: string }) {
    const params = new URLSearchParams();
    const nextStatus = next.status === undefined ? status : next.status;
    const nextType = next.type === undefined ? type : next.type;
    const nextQ = next.q === undefined ? q : next.q;
    if (nextStatus) params.set("status", nextStatus);
    if (nextType) params.set("type", nextType);
    if (nextQ) params.set("q", nextQ);
    const qs = params.toString();
    return qs ? `/admin/requests?${qs}` : "/admin/requests";
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">차량 요청·매입·폐차 상담</h1>
          <p className="mt-1 text-sm text-muted">
            홈의 원하는 차량 요청·매입 상담·폐차 견적이 모입니다. 딜러 매물은{" "}
            <Link href="/admin/vehicles?status=review" className="font-semibold text-primary underline">
              매물 관리 → 검토 중
            </Link>
            .
          </p>
        </div>
        <form className="flex flex-wrap gap-2" action="/admin/requests" method="get">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          {type ? <input type="hidden" name="type" value={type} /> : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="이름·연락처·모델·번호판"
            className="min-w-[14rem] rounded-md border border-line px-3 py-2 text-sm"
          />
          <button className="rounded-md border border-line px-3 py-2 text-sm font-semibold">검색</button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={hrefFor({ status: "" })} className={!status ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
          상태 전체 ({requests.length})
        </Link>
        {(["new", "consulting", "closed"] as const).map((value) => {
          const count = requests.filter((item) => item.status === value).length;
          return (
            <Link key={value} href={hrefFor({ status: value })} className={status === value ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
              {statusLabelKo[value]} ({count})
            </Link>
          );
        })}
        <span className="text-line">|</span>
        <Link href={hrefFor({ type: "" })} className={!type ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
          유형 전체
        </Link>
        {(["wanted", "sell", "scrap"] as const).map((value) => {
          const count = requests.filter((item) => item.type === value).length;
          return (
            <Link key={value} href={hrefFor({ type: value })} className={type === value ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
              {typeLabel[value]} ({count})
            </Link>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-3 py-2">접수</th>
              <th className="px-3 py-2">유형</th>
              <th className="px-3 py-2">모델</th>
              <th className="px-3 py-2">연락처</th>
              <th className="px-3 py-2">조건</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((request) => {
                const conditions = conditionSummary(request);
                return (
                  <tr key={request.id} className="border-b border-line align-top">
                    <td className="whitespace-nowrap px-3 py-3 text-muted">{request.createdAt.slice(0, 10)}</td>
                    <td className="px-3 py-3">
                      <span className="font-semibold text-ink">{typeLabel[request.type]}</span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">{request.model || "-"}</p>
                      {request.plateNo ? <p className="mt-0.5 text-xs text-muted">{request.plateNo}</p> : null}
                      {request.firstReferralCode ? <p className="mt-0.5 text-xs text-muted">코드 {request.firstReferralCode}</p> : null}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">{request.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{request.phone || request.email || "-"}</p>
                      {request.phone && request.email ? <p className="mt-0.5 text-xs text-muted">{request.email}</p> : null}
                    </td>
                    <td className="px-3 py-3">
                      {conditions.length ? (
                        <ul className="flex max-w-[18rem] flex-wrap gap-1.5">
                          {conditions.map((item) => (
                            <li key={item} className="rounded-md bg-[#f4f6f8] px-2 py-0.5 text-xs text-ink">
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-semibold text-primary">메모·첨부·저장</summary>
                        <div className="mt-2 grid max-w-md gap-2 rounded-md border border-line bg-[#fafbfc] p-3">
                          {request.message ? <p className="whitespace-pre-wrap text-xs text-ink">{request.message}</p> : <p className="text-xs text-muted">고객 메시지 없음</p>}
                          {request.files.length ? (
                            <ul className="space-y-1 text-xs">
                              {request.files.map((file) => (
                                <li key={file.id}>
                                  <a className="text-primary" href={`/api/media/private/${file.id}`}>
                                    {file.originalName}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          <PatchForm action={`/api/admin/requests/${request.id}`}>
                            <input type="hidden" name="status" value={request.status} />
                            <label className="grid gap-1 text-xs">
                              스태프 메모
                              <textarea
                                name="staffMemo"
                                defaultValue={request.staffMemo ?? ""}
                                rows={2}
                                className="rounded-md border border-line px-2 py-1.5 text-sm"
                              />
                            </label>
                          </PatchForm>
                        </div>
                      </details>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{statusLabelKo[request.status]}</td>
                    <td className="px-3 py-3">
                      <RequestQuickActions
                        requestId={request.id}
                        status={request.status}
                        type={request.type}
                        name={request.name}
                        staffMemo={request.staffMemo}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted">
                  조건에 맞는 요청이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
