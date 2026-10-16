import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { parseSettings } from "@/lib/domain/validation";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const parsed = parseSettings(await request.json());
  if (!parsed.ok) return NextResponse.json({ ok: false, code: "invalid", errors: parsed.errors }, { status: 400 });
  await getRepository().updateSettings(parsed.data);
  return NextResponse.json({ ok: true });
}
