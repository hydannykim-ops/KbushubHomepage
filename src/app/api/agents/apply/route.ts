import { getRepository } from "@/lib/data/repository";
import { acceptOrReject } from "@/lib/domain/submit";
import { parsePartner } from "@/lib/domain/validation";
import { crossOrigin, readBody, resultResponse } from "@/lib/http/form";
import { allowRequest, clientKey } from "@/lib/http/rate-limit";
import { openGate } from "@/lib/server/gate";
import { langFromBody } from "@/lib/request-context";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const fallback = "/ko/partner";
  if (crossOrigin(request)) return resultResponse(request, { status: 403, body: { ok: false, code: "origin" } }, fallback);
  if (!allowRequest(`partner:${clientKey(request)}`)) return resultResponse(request, { status: 429, body: { ok: false, code: "rate_limited" } }, fallback);
  const body = await readBody(request);
  const lang = langFromBody(body.lang);
  const parsed = parsePartner(body, lang);
  if (!parsed.ok) return resultResponse(request, { status: 400, body: { ok: false, code: "invalid", errors: parsed.errors } }, `/${lang}/partner`);
  const gate = await openGate();
  const result = await acceptOrReject(gate, () => getRepository().applyAgent(parsed.data));
  return resultResponse(request, result, `/${lang}/partner`);
}
