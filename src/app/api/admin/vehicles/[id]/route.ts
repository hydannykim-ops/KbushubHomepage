import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { DataAccessError } from "@/lib/data/errors";
import { StoreError } from "@/lib/demo/store";
import { parseVehicle } from "@/lib/domain/validation";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await context.params;
  const vehicle = await getRepository().getAdminVehicle(id);
  if (!vehicle) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json(vehicle);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await context.params;
  const parsed = parseVehicle(await request.json());
  if (!parsed.ok) return NextResponse.json({ ok: false, code: "invalid", errors: parsed.errors }, { status: 400 });
  try {
    const vehicle = await getRepository().updateVehicle(id, parsed.data);
    return NextResponse.json({ ok: true, id: vehicle.id });
  } catch (error) {
    if (error instanceof StoreError) return NextResponse.json({ ok: false, code: error.code }, { status: 400 });
    if (error instanceof DataAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: 503 });
    throw error;
  }
}
