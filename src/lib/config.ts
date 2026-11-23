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

/** Public canonical origin used in sitemap, Open Graph, and share links. */
export const CANONICAL_SITE_URL = "https://www.kbushub.com";

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    const cleaned = raw.replace(/\/$/, "");
    try {
      // Production must not publish vercel.app hosts in sitemap/canonical tags.
      if (new URL(cleaned).hostname.endsWith(".vercel.app")) return CANONICAL_SITE_URL;
    } catch {
      return CANONICAL_SITE_URL;
    }
    return cleaned;
  }
  if (process.env.VERCEL_ENV === "production") return CANONICAL_SITE_URL;
  return "http://localhost:3000";
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
