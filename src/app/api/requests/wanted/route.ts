import { getRepository } from "@/lib/data/repository";
import { acceptOrReject } from "@/lib/domain/submit";
import { parseWanted } from "@/lib/domain/validation";
import { crossOrigin, readBody, resultResponse } from "@/lib/http/form";
import { allowRequest, clientKey } from "@/lib/http/rate-limit";
import { langFromBody, referralFromRequest } from "@/lib/request-context";
import { openGate } from "@/lib/server/gate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const fallback = "/ko/wanted";
  if (crossOrigin(request)) return resultResponse(request, { status: 403, body: { ok: false, code: "origin" } }, fallback);
  if (!allowRequest(`wanted:${clientKey(request)}`)) return resultResponse(request, { status: 429, body: { ok: false, code: "rate_limited" } }, fallback);
  const body = await readBody(request);
  const lang = langFromBody(body.lang);
  const parsed = parseWanted(body, lang);
  if (!parsed.ok) return resultResponse(request, { status: 400, body: { ok: false, code: "invalid", errors: parsed.errors } }, `/${lang}/wanted`);
  const gate = await openGate();
  const referral = await referralFromRequest();
  const result = await acceptOrReject(gate, () => getRepository().createWanted(parsed.data, referral.firstReferralCode));
  return resultResponse(request, result, `/${lang}/wanted`);
}
