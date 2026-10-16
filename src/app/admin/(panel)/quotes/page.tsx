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
      <h1 className="text-2xl font-bold">견적 관리</h1>
      <div className="grid gap-3">
        {quotes.length ? (
          quotes.map((quote) => {
            const summary = summarizeQuote(quote);
            return (
              <article key={quote.id} className="rounded-lg border border-line bg-white p-4 text-sm">
                <p className="font-semibold">
                  {quote.vehicleStockNo ?? "-"} · v{quote.version} · {quote.createdAt.slice(0, 16)}
                </p>
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
