import Link from "next/link";
import { AdminDeleteButton } from "@/components/admin/delete-button";
import { getRepository } from "@/lib/data/repository";
import { formatMoney, quoteLineKeys, summarizeQuote } from "@/lib/domain/money";
import type { QuoteLineKey } from "@/lib/domain/types";

const lineLabels: Record<QuoteLineKey, string> = {
  vehiclePrice: "차량대금",
  domesticTransport: "국내 운송비",
  exportCosts: "수출 관련 비용",
  oceanFreight: "해상운임",
  otherCosts: "보험·검사 등 기타",
};

export default async function QuotesPage() {
  const quotes = await getRepository().listQuotes();
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">견적 관리</h1>
          <p className="mt-1 text-sm text-muted">견적은 문의 상세에서 작성합니다. 저장하면 문의 상태가 신규/상담 중일 때 견적 발송으로 바뀝니다.</p>
        </div>
        <Link href="/admin/inquiries" className="rounded-md border border-line px-3 py-2 text-sm font-semibold">
          문의에서 작성
        </Link>
      </div>
      <div className="grid gap-3">
        {quotes.length ? (
          quotes.map((quote) => {
            const summary = summarizeQuote(quote);
            return (
              <article key={quote.id} className="rounded-lg border border-line bg-white p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold">
                    {quote.vehicleStockNo ?? "-"} · v{quote.version} · {quote.createdAt.slice(0, 16).replace("T", " ")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/inquiries/${quote.inquiryId}`} className="rounded-md border border-line px-2 py-1 text-xs font-semibold">
                      문의 열기
                    </Link>
                    <AdminDeleteButton
                      action={`/api/admin/quotes/${quote.id}`}
                      confirmMessage={`견적 v${quote.version}을 삭제할까요?`}
                    />
                  </div>
                </div>
                <p className="mt-2">
                  {summary.confirmed && summary.total != null
                    ? `총액 ${formatMoney(summary.total, summary.currency, "ko")}`
                    : `총액 미확정 · 확인된 항목 합계 ${formatMoney(summary.knownSubtotal, summary.currency, "ko")} (총액 아님)`}
                </p>
                <ul className="mt-2 space-y-1">
                  {quoteLineKeys.map((key) => {
                    const line = quote.lines[key];
                    const value =
                      line?.status === "unknown"
                        ? "미확인"
                        : line?.status === "zero"
                          ? formatMoney(0, quote.currency, "ko")
                          : formatMoney(line?.amount ?? 0, quote.currency, "ko");
                    return (
                      <li key={key}>
                        {lineLabels[key]}: {value}
                      </li>
                    );
                  })}
                </ul>
                <p className="text-muted">
                  미확인: {summary.unknownKeys.map((key) => lineLabels[key]).join(", ") || "없음"} / 0원:{" "}
                  {summary.zeroKeys.map((key) => lineLabels[key]).join(", ") || "없음"}
                </p>
                <p>포함 {quote.includedItems ?? "-"}</p>
                <p>제외 {quote.excludedItems ?? "-"}</p>
                <p>조건 {quote.tradeTerms ?? "-"}</p>
                <p>유효기간 {quote.validUntil ?? "-"}</p>
              </article>
            );
          })
        ) : (
          <p className="text-sm text-muted">작성된 견적이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
