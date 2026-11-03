import Link from "next/link";
import { PatchForm } from "@/components/admin/patch-form";
import { getRepository } from "@/lib/data/repository";
import type { AgentStatus } from "@/lib/domain/types";

const statusLabel: Record<AgentStatus, string> = {
  pending: "승인 대기",
  approved: "승인",
  rejected: "거절",
  suspended: "정지",
};

const statusRank: Record<AgentStatus, number> = {
  pending: 0,
  approved: 1,
  suspended: 2,
  rejected: 3,
};

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const agents = (await getRepository().listAgents()).slice().sort((a, b) => {
    const rank = statusRank[a.status] - statusRank[b.status];
    if (rank !== 0) return rank;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const visible = status ? agents.filter((agent) => agent.status === status) : agents;

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">에이전트 관리</h1>
      <p className="text-sm text-muted">
        승인해도 초대 메일을 보내지 않습니다. 운영 모드에서는 Supabase 사용자를 만든 뒤 사용자 UUID를 연결하세요. 이 화면에서는 관리자 권한을 부여하지 않습니다.
      </p>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/agents" className={!status ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
          전체 ({agents.length})
        </Link>
        {(["pending", "approved", "suspended", "rejected"] as const).map((value) => {
          const count = agents.filter((agent) => agent.status === value).length;
          return (
            <Link
              key={value}
              href={`/admin/agents?status=${value}`}
              className={status === value ? "font-semibold text-ink" : "text-muted hover:text-ink"}
            >
              {statusLabel[value]} ({count})
            </Link>
          );
        })}
      </div>

      {visible.length ? (
        visible.map((agent) => (
          <article key={agent.id} className="rounded-lg border border-line bg-white p-4 text-sm">
            <p className="font-semibold">
              {agent.name} · {agent.referralCode} · {statusLabel[agent.status]}
            </p>
            <p>{agent.email}</p>
            <p>
              {agent.country ?? "-"} {agent.company ?? ""}
            </p>
            <p className="mt-2 whitespace-pre-wrap">{agent.message}</p>
            <div className="mt-3">
              <PatchForm action={`/api/admin/agents/${agent.id}`}>
                <select name="status" defaultValue={agent.status} className="rounded-md border border-line px-2 py-2">
                  <option value="pending">승인 대기</option>
                  <option value="approved">승인</option>
                  <option value="rejected">거절</option>
                  <option value="suspended">정지</option>
                </select>
                <input
                  name="userId"
                  defaultValue={agent.userId ?? ""}
                  placeholder="Supabase 사용자 UUID"
                  className="rounded-md border border-line px-2 py-2"
                />
              </PatchForm>
            </div>
          </article>
        ))
      ) : (
        <p className="text-sm text-muted">조건에 맞는 에이전트가 없습니다.</p>
      )}
    </div>
  );
}
