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
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">대시보드</h1>
      {getDataSource() === "demo" ? <p className="text-sm">데모 데이터 집계입니다. 실제 영업 실적이 아닙니다.</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["판매 중", count("available")],
          ["예약 중", count("reserved")],
          ["판매 완료", count("sold")],
          ["비공개", count("hidden")],
          ["검토 중", count("review")],
          ["문의", inquiries.length],
          ["신규 문의", inquiries.filter((item) => item.status === "new").length],
          ["승인 대기 에이전트", agents.filter((agent) => agent.status === "pending").length],
          ["차량 요청·매입", requests.length],
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-lg border border-line bg-white p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </article>
        ))}
      </div>
      <p className="text-sm text-muted">내부 손익은 매물별로만 확인합니다. 통화가 다르거나 금액이 비어 있으면 계산하지 않습니다.</p>
    </div>
  );
}
