export type ResolvedSource = "demo" | "supabase" | "misconfigured";

export function supabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "",
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "",
    service: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "",
  };
}

export function isSupabaseConfigured(): boolean {
  const env = supabaseEnv();
  return Boolean(env.url && env.anon && env.service);
}

export function getDataSource(): ResolvedSource {
  const explicit = process.env.DATA_SOURCE?.trim();
  if (!explicit) return isSupabaseConfigured() ? "supabase" : "demo";
  if (explicit === "demo") return "demo";
  if (explicit === "supabase") return isSupabaseConfigured() ? "supabase" : "misconfigured";
  return "misconfigured";
}

export function siteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return value.replace(/\/$/, "");
}

export function demoCredentials() {
  return {
    adminEmail: process.env.DEMO_ADMIN_EMAIL?.trim() || "admin@demo.kbus",
    adminPassword: process.env.DEMO_ADMIN_PASSWORD?.trim() || "demo-admin",
    agentEmail: process.env.DEMO_AGENT_EMAIL?.trim() || "agent@demo.kbus",
    agentPassword: process.env.DEMO_AGENT_PASSWORD?.trim() || "demo-agent",
    sessionSecret: process.env.DEMO_SESSION_SECRET?.trim() || "demo-session-secret-not-for-production",
  };
}
