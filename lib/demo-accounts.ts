export const DEMO_ADMIN_EMAIL = "admin@kbushub.demo";
export const DEMO_ADMIN_PASSWORD = "demo-admin-only";
export const DEMO_AGENT_EMAIL = "agent@kbushub.demo";
export const DEMO_AGENT_PASSWORD = "demo-agent-only";
export const DEMO_AGENT_CODE = "DEMOAGT1";

export function isLiveMode() {
  return process.env.DATA_MODE === "live";
}
