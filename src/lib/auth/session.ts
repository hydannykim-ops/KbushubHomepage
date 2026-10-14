import "server-only";
import { cookies } from "next/headers";
import { demoCredentials, getDataSource } from "../config";
import { readSession, safeEqualText, signSession } from "../domain/auth-token";
import type { Session } from "../domain/types";
import { createServiceClient, createSupabaseServer } from "../supabase/clients";

export const SESSION_COOKIE = "kb_session";

export async function getSession(): Promise<Session | null> {
  if (getDataSource() === "demo") {
    const jar = await cookies();
    return readSession(jar.get(SESSION_COOKIE)?.value, demoCredentials().sessionSecret);
  }
  if (getDataSource() !== "supabase") return null;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const service = createServiceClient();
  const roleResult = await service.from("user_roles").select("role").eq("user_id", data.user.id).maybeSingle();
  if (roleResult.data?.role === "admin") {
    return { sub: data.user.id, role: "admin", email: data.user.email ?? "", exp: Date.now() + 60_000 };
  }
  const agentResult = await service
    .from("agent_profiles")
    .select("id, referral_code, status")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (agentResult.data?.status === "approved") {
    return {
      sub: data.user.id,
      role: "agent",
      email: data.user.email ?? "",
      agentId: agentResult.data.id,
      referralCode: agentResult.data.referral_code,
      exp: Date.now() + 60_000,
    };
  }
  return null;
}

export async function requireAdmin(): Promise<Session | null> {
  const session = await getSession();
  return session?.role === "admin" ? session : null;
}

export async function requireAgent(): Promise<Session | null> {
  const session = await getSession();
  return session?.role === "agent" && session.referralCode ? session : null;
}

export function demoLogin(email: string, password: string, area: "admin" | "agent"): Session | null {
  if (getDataSource() !== "demo") return null;
  const creds = demoCredentials();
  if (area === "admin" && safeEqualText(email, creds.adminEmail) && safeEqualText(password, creds.adminPassword)) {
    return { sub: "demo-admin", role: "admin", email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  }
  if (area === "agent" && safeEqualText(email, creds.agentEmail) && safeEqualText(password, creds.agentPassword)) {
    return {
      sub: "demo-agent-user",
      role: "agent",
      email,
      agentId: "agent-demo-1",
      referralCode: "DEMOAGT1",
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
  }
  return null;
}

export function demoSessionToken(session: Session): string {
  return signSession(session, demoCredentials().sessionSecret);
}
