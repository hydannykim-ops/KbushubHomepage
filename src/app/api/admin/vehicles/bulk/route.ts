import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { DataAccessError } from "@/lib/data/errors";
import { StoreError } from "@/lib/demo/store";
import type { SaleStatus } from "@/lib/domain/types";

export const runtime = "nodejs";

const statuses = new Set<SaleStatus>(["available", "reserved", "sold", "hidden", "review"]);

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    ids?: unknown;
    action?: string;
    status?: string;
  } | null;
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id): id is string => typeof id === "string" && id.trim().length > 0) : [];
  if (!ids.length) return NextResponse.json({ ok: false, code: "ids_required" }, { status: 400 });
  if (ids.length > 100) return NextResponse.json({ ok: false, code: "too_many" }, { status: 400 });

  const repo = getRepository();
  try {
    if (body?.action === "delete") {
      const count = await repo.deleteVehicles(ids);
      return NextResponse.json({ ok: true, count });
    }
    if (body?.action === "status") {
      const status = body.status;
      if (!status || !statuses.has(status as SaleStatus)) {
        return NextResponse.json({ ok: false, code: "invalid_status" }, { status: 400 });
      }
      const count = await repo.setVehicleStatuses(ids, status as SaleStatus);
      return NextResponse.json({ ok: true, count, status });
    }
    return NextResponse.json({ ok: false, code: "invalid_action" }, { status: 400 });
  } catch (error) {
    if (error instanceof StoreError) return NextResponse.json({ ok: false, code: error.code }, { status: 400 });
    if (error instanceof DataAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: 503 });
    throw error;
  }
}
