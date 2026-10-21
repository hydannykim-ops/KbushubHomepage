import { NextResponse } from "next/server";
import { SESSION_COOKIE, demoLogin, demoSessionToken } from "@/lib/auth/session";
import { getDataSource } from "@/lib/config";
import { getRepository } from "@/lib/data/repository";
import { createServiceClient, createSupabaseServer } from "@/lib/supabase/clients";
import { crossOrigin, readBody } from "@/lib/http/form";
import { allowRequest, clientKey } from "@/lib/http/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (crossOrigin(request)) return NextResponse.json({ ok: false, code: "origin" }, { status: 403 });
  if (!allowRequest(`login:${clientKey(request)}`, 10)) return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  const body = await readBody(request);
  const area = body.area === "agent" ? "agent" : body.area === "member" ? "member" : "admin";
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const source = getDataSource();
  if (source === "demo") {
    const session =
      area === "member"
        ? await (async () => {
            const member = await getRepository().verifyMember(email, password);
            if (!member) return null;
            return {
              sub: member.id,
              role: member.role,
              email: member.email,
              name: member.name,
              exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
            };
          })()
        : demoLogin(email, password, area);
    if (!session) return NextResponse.json({ ok: false, code: "login_failed" }, { status: 401 });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, demoSessionToken(session), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }
  if (source !== "supabase") return NextResponse.json({ ok: false, code: "not_configured" }, { status: 503 });
  const supabase = await createSupabaseServer();
  const signed = await supabase.auth.signInWithPassword({ email, password });
  if (signed.error || !signed.data.user) return NextResponse.json({ ok: false, code: "login_failed" }, { status: 401 });
  const service = createServiceClient();
  if (area === "admin") {
    const role = await service.from("user_roles").select("role").eq("user_id", signed.data.user.id).maybeSingle();
    if (role.data?.role !== "admin") {
      await supabase.auth.signOut();
      return NextResponse.json({ ok: false, code: "login_failed" }, { status: 401 });
    }
  } else if (area === "agent") {
    const agent = await service.from("agent_profiles").select("status").eq("user_id", signed.data.user.id).maybeSingle();
    if (agent.data?.status !== "approved") {
      await supabase.auth.signOut();
      return NextResponse.json({ ok: false, code: "login_failed" }, { status: 401 });
    }
  } else {
    const member = await service.from("member_profiles").select("role").eq("user_id", signed.data.user.id).maybeSingle();
    if (member.data?.role !== "customer" && member.data?.role !== "dealer") {
      await supabase.auth.signOut();
      return NextResponse.json({ ok: false, code: "login_failed" }, { status: 401 });
    }
  }
  return NextResponse.json({ ok: true });
}
