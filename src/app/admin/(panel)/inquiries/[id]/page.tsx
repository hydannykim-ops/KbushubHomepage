import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminDeleteButton } from "@/components/admin/delete-button";
import { InquiryEditor } from "@/components/admin/editors";
import { InquiryChat } from "@/components/inquiry-chat";
import { getRepository } from "@/lib/data/repository";

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = getRepository();
  const inquiry = await repo.getInquiry(id);
  if (!inquiry) notFound();
  const [agents, history, thread, quotes] = await Promise.all([
    repo.listAgents(),
    repo.historyFor(id),
    repo.openInquiryThread(id, { memberId: null, email: null, admin: true }),
    repo.listQuotes(),
  ]);
  const relatedQuotes = quotes.filter((quote) => quote.inquiryId === inquiry.id);
  const approvedAgents = agents.filter((agent) => agent.status === "approved");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border border-line bg-white p-4 text-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-xl font-bold">{inquiry.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/inquiries" className="text-xs font-semibold text-muted hover:text-ink">
              목록
            </Link>
            <AdminDeleteButton
              action={`/api/admin/inquiries/${inquiry.id}`}
              confirmMessage={`${inquiry.name} 문의를 삭제할까요? 채팅·견적 이력도 함께 삭제됩니다.`}
              redirectTo="/admin/inquiries"
              className="rounded-md border border-[#f1c4c8] px-2 py-1 text-xs font-semibold text-[#9f1239] hover:bg-[#fff1f2] disabled:opacity-60"
            />
          </div>
        </div>
        <p className="mt-2">이메일 {inquiry.email ?? "-"}</p>
        <p>전화 {inquiry.phone ?? "-"}</p>
        <p>메신저 {inquiry.messenger ?? "-"}</p>
        <p>국가 {inquiry.country}</p>
        <p>
          매물{" "}
          {inquiry.stockNo ? (
            <Link href={`/admin/vehicles/${encodeURIComponent(inquiry.stockNo)}`} className="text-primary">
              {inquiry.stockNo}
            </Link>
          ) : (
            "-"
          )}
        </p>
        <p>
          구분 {inquiry.tradeMode} / {inquiry.kind}
        </p>
        <p>목적국 {inquiry.destinationCountry ?? "-"}</p>
        <p>목적항 {inquiry.destinationPortUndecided ? "미정" : inquiry.destinationPort ?? "-"}</p>
        <p>
          선적 방식{" "}
          {inquiry.shippingMethod === "roro"
            ? "RoRo"
            : inquiry.shippingMethod === "container"
              ? "컨테이너"
              : inquiry.shippingMethod === "undecided"
                ? "미정"
                : "-"}
        </p>
        <p>최초 유입 코드 {inquiry.firstReferralCode ?? "-"}</p>
        <p>제출 시 코드 {inquiry.submitReferralCode ?? "-"}</p>
        <p className="mt-3 whitespace-pre-wrap">{inquiry.message}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/admin/quotes/new?inquiry=${inquiry.id}`} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white">
            견적 작성
          </Link>
          {relatedQuotes.length ? (
            <Link href="/admin/quotes" className="rounded-md border border-line px-3 py-2 text-sm font-semibold">
              견적 {relatedQuotes.length}건 보기
            </Link>
          ) : null}
        </div>

        {relatedQuotes.length ? (
          <ul className="mt-3 space-y-1 text-muted">
            {relatedQuotes.map((quote) => (
              <li key={quote.id}>
                v{quote.version} · {quote.createdAt.slice(0, 16).replace("T", " ")} · {quote.currency}
              </li>
            ))}
          </ul>
        ) : null}

        <h2 className="mt-4 font-bold">담당 변경 이력</h2>
        <ul className="mt-2 space-y-2">
          {history.length ? (
            history.map((item) => (
              <li key={item.id}>
                {item.createdAt.slice(0, 16)} · {item.reason}
              </li>
            ))
          ) : (
            <li className="text-muted">이력이 없습니다.</li>
          )}
        </ul>
      </section>
      <div className="grid gap-6">
        <section className="rounded-lg border border-line bg-white p-4">
          <InquiryEditor inquiry={inquiry} agents={approvedAgents} />
        </section>
        {thread ? (
          <section className="rounded-lg border border-line bg-white p-4">
            <h2 className="mb-1 text-lg font-bold">문의 채팅</h2>
            <p className="mb-3 text-sm text-muted">실시간 대화입니다. 위쪽 &quot;고객 답변 메모&quot;와는 별개로 고객 계정 채팅에 표시됩니다.</p>
            <InquiryChat
              inquiry={thread.inquiry}
              messages={thread.messages}
              viewerRole={thread.viewerRole}
              lang="ko"
              action={`/api/account/inquiries/${encodeURIComponent(inquiry.id)}/messages`}
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}
