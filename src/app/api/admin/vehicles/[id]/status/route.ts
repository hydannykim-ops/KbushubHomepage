import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { DataAccessError } from "@/lib/data/errors";
import { StoreError } from "@/lib/demo/store";
import type { SaleStatus } from "@/lib/domain/types";

export const runtime = "nodejs";

const statuses = new Set<SaleStatus>(["available", "reserved", "sold", "hidden", "review"]);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { status?: string } | null;
  const status = body?.status;
  if (!status || !statuses.has(status as SaleStatus)) {
    return NextResponse.json({ ok: false, code: "invalid_status" }, { status: 400 });
  }
  try {
    const count = await getRepository().setVehicleStatuses([id], status as SaleStatus);
    if (!count) return NextResponse.json({ ok: false, code: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, id, status });
  } catch (error) {
    if (error instanceof StoreError) return NextResponse.json({ ok: false, code: error.code }, { status: 400 });
    if (error instanceof DataAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: 503 });
    throw error;
  }
}
