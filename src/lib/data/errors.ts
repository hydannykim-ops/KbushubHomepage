export class DataAccessError extends Error {
  code: "misconfigured" | "upstream";
  context?: string;
  detail?: string;

  constructor(code: "misconfigured" | "upstream", options?: { context?: string; detail?: string }) {
    super(code);
    this.code = code;
    this.context = options?.context;
    this.detail = options?.detail;
  }
}

/** Safe snippet for UI / API — no secrets, short. */
export function sanitizeErrorDetail(value: unknown, max = 180): string {
  const raw =
    value && typeof value === "object" && "message" in value
      ? String((value as { message?: unknown }).message ?? "")
      : String(value ?? "");
  return raw
    .replace(/service_role|eyJ[A-Za-z0-9_-]{20,}/gi, "[redacted]")
    .replace(/https?:\/\/[^\s]+/gi, "[url]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
