import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { parseRequestUpdate } from "@/lib/domain/validation";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const parsed = parseRequestUpdate(await request.json());
  if (!parsed.ok) return NextResponse.json({ ok: false, code: "invalid", errors: parsed.errors }, { status: 400 });
  await getRepository().updateRequest((await context.params).id, parsed.data);
  return NextResponse.json({ ok: true });
}
