import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { StoreError } from "@/lib/demo/store";

export const runtime = "nodejs";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    await getRepository().deleteQuote((await context.params).id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof StoreError) return NextResponse.json({ ok: false, code: error.code }, { status: 400 });
    throw error;
  }
}
