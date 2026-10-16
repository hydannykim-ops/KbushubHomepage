import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { StoreError } from "@/lib/demo/store";
import { parseQuote } from "@/lib/domain/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const parsed = parseQuote(await request.json());
  if (!parsed.ok) return NextResponse.json({ ok: false, code: "invalid", errors: parsed.errors }, { status: 400 });
  try {
    const quote = await getRepository().createQuote(parsed.data);
    return NextResponse.json({ ok: true, id: quote.id, version: quote.version });
  } catch (error) {
    if (error instanceof StoreError) return NextResponse.json({ ok: false, code: error.code }, { status: 400 });
    throw error;
  }
}
