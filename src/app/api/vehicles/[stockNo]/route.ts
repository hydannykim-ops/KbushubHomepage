import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";
import { DataAccessError } from "@/lib/data/errors";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ stockNo: string }> }) {
  const { stockNo } = await context.params;
  try {
    const vehicle = await getRepository().getPublicByStockNo(stockNo);
    if (!vehicle) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json(vehicle);
  } catch (error) {
    if (error instanceof DataAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: 503 });
    throw error;
  }
}
