import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/config";

export function GET() {
  return NextResponse.json({ dataSource: getDataSource() });
}
