import Link from "next/link";
import { getDataSource } from "@/lib/config";
import { getRepository } from "@/lib/data/repository";

export default async function AdminHome() {
  const repo = getRepository();
  const [vehicles, inquiries, agents, requests] = await Promise.all([
    repo.listAdminVehicles(),
    repo.listInquiries(),
    repo.listAgents(),
    repo.listRequests(),
  ]);
  const count = (status: string) => vehicles.filter((vehicle) => vehicle.status === status).length;
  const cards: Array<{ label: string; value: number; href: string }> = [
    { label: "판매 중", value: count("available"), href: "/admin/vehicles?status=available" },
    { label: "예약 중", value: count("reserved"), href: "/admin/vehicles?status=reserved" },
    { label: "판매 완료", value: count("sold"), href: "/admin/vehicles?status=sold" },
    { label: "비공개", value: count("hidden"), href: "/admin/vehicles?status=hidden" },
    { label: "검토 중 (딜러 등록)", value: count("review"), href: "/admin/vehicles?status=review" },
    { label: "문의", value: inquiries.length, href: "/admin/inquiries" },
    { label: "신규 문의", value: inquiries.filter((item) => item.status === "new").length, href: "/admin/inquiries" },
    { label: "승인 대기 에이전트", value: agents.filter((agent) => agent.status === "pending").length, href: "/admin/agents" },
    { label: "차량 요청·매입", value: requests.length, href: "/admin/requests" },
  ];

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">대시보드</h1>
      {getDataSource() === "demo" ? <p className="text-sm">데모 데이터 집계입니다. 실제 영업 실적이 아닙니다.</p> : null}
      <p className="text-sm text-muted">
        딜러가 <strong className="font-semibold text-ink">내 차 팔기</strong>로 올린 매물은{" "}
        <Link href="/admin/vehicles?status=review" className="font-semibold text-primary underline">
          매물 관리 → 검토 중
        </Link>
        에 있습니다. 홈의 <strong className="font-semibold text-ink">원하는 차량 요청</strong>은{" "}
        <Link href="/admin/requests" className="font-semibold text-primary underline">
          차량 요청·매입
        </Link>
        메뉴입니다.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-lg border border-line bg-white p-4 transition-colors hover:border-ink">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted">내부 손익은 매물별로만 확인합니다. 통화가 다르거나 금액이 비어 있으면 계산하지 않습니다.</p>
    </div>
  );
}
