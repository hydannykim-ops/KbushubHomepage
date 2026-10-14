import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";
import { DataAccessError } from "@/lib/data/errors";
import { parseVehicleQuery } from "@/lib/domain/filters";
import { parseMode } from "@/lib/request-context";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = parseMode(url.searchParams.get("mode")) ?? "domestic";
  try {
    const result = await getRepository().listPublic(parseVehicleQuery(url.searchParams), mode);
    return NextResponse.json({ items: result.items, ignoredPriceFilter: result.ignoredPriceFilter });
  } catch (error) {
    if (error instanceof DataAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: 503 });
    throw error;
  }
}
