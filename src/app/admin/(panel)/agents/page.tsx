import { PatchForm } from "@/components/admin/patch-form";
import { getRepository } from "@/lib/data/repository";

export default async function AgentsPage() {
  const agents = await getRepository().listAgents();
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">에이전트 관리</h1>
      <p className="text-sm text-muted">승인해도 초대 메일을 보내지 않습니다. 운영 모드에서는 Supabase 사용자를 만든 뒤 사용자 UUID를 연결하세요. 이 화면에서는 관리자 권한을 부여하지 않습니다.</p>
      {agents.map((agent) => (
        <article key={agent.id} className="rounded-lg border border-line bg-white p-4 text-sm">
          <p className="font-semibold">
            {agent.name} · {agent.referralCode} · {agent.status}
          </p>
          <p>{agent.email}</p>
          <p>{agent.country ?? "-"} {agent.company ?? ""}</p>
          <p className="mt-2 whitespace-pre-wrap">{agent.message}</p>
          <div className="mt-3">
            <PatchForm action={`/api/admin/agents/${agent.id}`}>
              <select name="status" defaultValue={agent.status} className="rounded-md border border-line px-2 py-2">
                <option value="pending">승인 대기</option>
                <option value="approved">승인</option>
                <option value="rejected">거절</option>
                <option value="suspended">정지</option>
              </select>
              <input name="userId" defaultValue={agent.userId ?? ""} placeholder="Supabase 사용자 UUID" className="rounded-md border border-line px-2 py-2" />
            </PatchForm>
          </div>
        </article>
      ))}
    </div>
  );
}
