import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, isLiveMode } from "./demo-accounts";

export type Session = { role: "admin" | "agent"; sub: string; exp: number };

function secret() {
  const value = process.env.AUTH_SECRET;
  if (value) return value;
  if (isLiveMode()) return "";
  return "demo-only-secret-change-me";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

export function encodeSession(session: Session) {
  const key = secret();
  if (!key) return "";
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token || !secret()) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if ((data.role !== "admin" && data.role !== "agent") || !data.sub || data.exp < Date.now()) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function readSession() {
  const jar = await cookies();
  return decodeSession(jar.get("kb_session")?.value);
}

export async function writeSession(session: Session) {
  const jar = await cookies();
  jar.set("kb_session", encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete("kb_session");
}

export function adminPasswordOk(email: string, password: string) {
  if (isLiveMode()) {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET) {
      return false;
    }
    return email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
  }
  const expectedEmail = process.env.ADMIN_EMAIL || DEMO_ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD || DEMO_ADMIN_PASSWORD;
  return email === expectedEmail && password === expectedPassword;
}

export async function requireAdmin() {
  const session = await readSession();
  return session?.role === "admin" ? session : null;
}

export async function requireAgent() {
  const session = await readSession();
  return session?.role === "agent" ? session : null;
}
