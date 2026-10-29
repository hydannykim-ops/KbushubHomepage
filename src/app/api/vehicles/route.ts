import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";
import { DataAccessError } from "@/lib/data/errors";
import { parseVehicleQuery } from "@/lib/domain/filters";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    // Browse mode removed; price filters use domestic KRW listing prices.
    const result = await getRepository().listPublic(parseVehicleQuery(url.searchParams), "domestic");
    return NextResponse.json({ items: result.items, ignoredPriceFilter: result.ignoredPriceFilter });
  } catch (error) {
    if (error instanceof DataAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: 503 });
    throw error;
  }
}
