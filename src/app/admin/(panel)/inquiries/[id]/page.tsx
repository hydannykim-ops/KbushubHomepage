import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryEditor } from "@/components/admin/editors";
import { InquiryChat } from "@/components/inquiry-chat";
import { getRepository } from "@/lib/data/repository";

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = getRepository();
  const inquiry = await repo.getInquiry(id);
  if (!inquiry) notFound();
  const [agents, history, thread] = await Promise.all([
    repo.listAgents(),
    repo.historyFor(id),
    repo.openInquiryThread(id, { memberId: null, email: null, admin: true }),
  ]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border border-line bg-white p-4 text-sm">
        <h1 className="text-xl font-bold">{inquiry.name}</h1>
        <p className="mt-2">이메일 {inquiry.email ?? "-"}</p>
        <p>전화 {inquiry.phone ?? "-"}</p>
        <p>메신저 {inquiry.messenger ?? "-"}</p>
        <p>국가 {inquiry.country}</p>
        <p>매물 {inquiry.stockNo ?? "-"}</p>
        <p>구분 {inquiry.tradeMode} / {inquiry.kind}</p>
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
        <h2 className="mt-4 font-bold">담당 변경 이력</h2>
        <ul className="mt-2 space-y-2">
          {history.map((item) => (
            <li key={item.id}>
              {item.createdAt.slice(0, 16)} · {item.reason}
            </li>
          ))}
        </ul>
        <Link href={`/admin/quotes/new?inquiry=${inquiry.id}`} className="mt-4 inline-block text-primary">
          견적 작성
        </Link>
      </section>
      <div className="grid gap-6">
        <section className="rounded-lg border border-line bg-white p-4">
          <InquiryEditor inquiry={inquiry} agents={agents} />
        </section>
        {thread ? (
          <section className="rounded-lg border border-line bg-white p-4">
            <h2 className="mb-3 text-lg font-bold">문의 채팅</h2>
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
