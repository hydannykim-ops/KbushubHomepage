import { NextResponse } from "next/server";
import { chatReply } from "@/lib/chat/engine";
import type { Lang } from "@/lib/domain/types";
import { langs } from "@/lib/i18n/langs";
import { crossOrigin, readBody } from "@/lib/http/form";
import { allowRequest, clientKey } from "@/lib/http/rate-limit";

export const runtime = "nodejs";

function parseLang(value: unknown): Lang {
  const raw = String(value ?? "ko");
  return (langs as readonly string[]).includes(raw) ? (raw as Lang) : "ko";
}

export async function POST(request: Request) {
  if (crossOrigin(request)) return NextResponse.json({ ok: false, code: "origin" }, { status: 403 });
  if (!allowRequest(`chat:${clientKey(request)}`, 40)) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }
  const body = await readBody(request);
  const message = String(body.message ?? "").trim().slice(0, 500);
  if (!message) return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  const lang = parseLang(body.lang);
  const reply = chatReply(lang, message);
  return NextResponse.json({
    ok: true,
    intent: reply.intent,
    text: reply.text,
    links: reply.links ?? [],
    suggestions: reply.suggestions ?? [],
  });
}
