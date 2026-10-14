import { NextResponse } from "next/server";
import { publicData } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const data = await publicData();
  if (!data.ok) {
    return NextResponse.json(
      { error: data.reason },
      { status: data.reason === "live_not_connected" ? 503 : 500 },
    );
  }
  return NextResponse.json({
    vehicles: data.vehicles.filter((vehicle) => vehicle.status !== "hidden"),
  });
}
