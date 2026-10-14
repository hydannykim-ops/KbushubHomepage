import { createHmac, timingSafeEqual } from "node:crypto";
import type { Session } from "./types";

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signSession(session: Session, secret: string): string {
  const body = b64url(JSON.stringify(session));
  const mac = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function readSession(token: string | undefined, secret: string, now = Date.now()): Session | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Session;
    if (!parsed?.sub || !parsed.role || !parsed.email || typeof parsed.exp !== "number") return null;
    if (parsed.exp < now) return null;
    if (parsed.role !== "admin" && parsed.role !== "agent") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function safeEqualText(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
