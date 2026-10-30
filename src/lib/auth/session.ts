import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { demoCredentials, getDataSource } from "../config";
import { readSession, safeEqualText, signSession } from "../domain/auth-token";
import type { Session } from "../domain/types";
import { createServiceClient, createSupabaseServer } from "../supabase/clients";

export const SESSION_COOKIE = "kb_session";

/** Deduped per request — layout + page both call this. */
export const getSession = cache(async (): Promise<Session | null> => {
  if (getDataSource() === "demo") {
    const jar = await cookies();
    return readSession(jar.get(SESSION_COOKIE)?.value, demoCredentials().sessionSecret);
  }
  if (getDataSource() !== "supabase") return null;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const service = createServiceClient();
  const userId = data.user.id;
  const email = data.user.email ?? "";
  const [roleResult, agentResult, memberResult] = await Promise.all([
    service.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
    service.from("agent_profiles").select("id, referral_code, status").eq("user_id", userId).maybeSingle(),
    service.from("member_profiles").select("role, name").eq("user_id", userId).maybeSingle(),
  ]);
  if (roleResult.data?.role === "admin") {
    return { sub: userId, role: "admin", email, exp: Date.now() + 60_000 };
  }
  if (agentResult.data?.status === "approved") {
    return {
      sub: userId,
      role: "agent",
      email,
      agentId: agentResult.data.id,
      referralCode: agentResult.data.referral_code,
      exp: Date.now() + 60_000,
    };
  }
  const memberRole = memberResult.data?.role;
  if (memberRole === "customer" || memberRole === "dealer") {
    return {
      sub: userId,
      role: memberRole,
      email,
      name: typeof memberResult.data?.name === "string" ? memberResult.data.name : undefined,
      exp: Date.now() + 60_000,
    };
  }
  return null;
});

export async function requireAdmin(): Promise<Session | null> {
  const session = await getSession();
  return session?.role === "admin" ? session : null;
}

export async function requireAgent(): Promise<Session | null> {
  const session = await getSession();
  return session?.role === "agent" && session.referralCode ? session : null;
}

export async function requireMember(): Promise<Session | null> {
  const session = await getSession();
  return session && (session.role === "customer" || session.role === "dealer") ? session : null;
}

export async function requireDealer(): Promise<Session | null> {
  const session = await getSession();
  return session?.role === "dealer" ? session : null;
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
