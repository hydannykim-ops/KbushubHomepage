import { resultResponse } from "@/lib/http/form";

export const runtime = "nodejs";

/** Public self-listing is closed. Staff register inventory in /admin/vehicles. */
export async function POST(request: Request) {
  return resultResponse(request, { status: 403, body: { ok: false, code: "forbidden" } }, "/ko/sell");
}
