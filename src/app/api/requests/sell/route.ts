import { getRepository } from "@/lib/data/repository";
import { acceptOrReject } from "@/lib/domain/submit";
import { checkImage, MAX_SELL_PHOTOS } from "@/lib/domain/uploads";
import { parseSell } from "@/lib/domain/validation";
import { crossOrigin, resultResponse } from "@/lib/http/form";
import { allowRequest, clientKey } from "@/lib/http/rate-limit";
import { langFromBody, referralFromRequest } from "@/lib/request-context";
import { openGate } from "@/lib/server/gate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const fallback = "/ko/sell";
  if (crossOrigin(request)) return resultResponse(request, { status: 403, body: { ok: false, code: "origin" } }, fallback);
  if (!allowRequest(`sell:${clientKey(request)}`)) return resultResponse(request, { status: 429, body: { ok: false, code: "rate_limited" } }, fallback);
  const form = await request.formData();
  const body: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) if (typeof value === "string") body[key] = value;
  const lang = langFromBody(body.lang);
  const parsed = parseSell(body, lang);
  if (!parsed.ok) return resultResponse(request, { status: 400, body: { ok: false, code: "invalid", errors: parsed.errors } }, `/${lang}/sell`);
  const files = form.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > MAX_SELL_PHOTOS) return resultResponse(request, { status: 400, body: { ok: false, code: "invalid" } }, `/${lang}/sell`);
  const stored: Array<{ bytes: Buffer; contentType: "image/jpeg" | "image/png" | "image/webp"; originalName: string }> = [];
  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const checked = checkImage(bytes);
    if (!checked.ok) return resultResponse(request, { status: 400, body: { ok: false, code: "invalid" } }, `/${lang}/sell`);
    stored.push({ bytes, contentType: checked.contentType, originalName: file.name || "photo" });
  }
  const gate = await openGate();
  const referral = await referralFromRequest();
  const result = await acceptOrReject(gate, () => getRepository().createSell(parsed.data, stored, referral.firstReferralCode));
  return resultResponse(request, result, `/${lang}/sell`);
}
