import { NextResponse } from "next/server";
import { publicData } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await publicData();
  if (!data.ok) {
    return NextResponse.json({ error: data.reason }, { status: 503 });
  }
  const vehicle = data.vehicles.find((item) => item.id === id && item.status !== "hidden");
  if (!vehicle) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ vehicle });
}
