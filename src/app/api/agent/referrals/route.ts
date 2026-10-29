import { NextResponse } from "next/server";
import { requireAgent } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

export const runtime = "nodejs";

export async function GET() {
  const agent = await requireAgent();
  if (!agent?.referralCode) return NextResponse.json({ ok: false }, { status: 401 });
  const items = await getRepository().agentReferrals(agent.referralCode);
  return NextResponse.json({ items });
}
