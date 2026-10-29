import { getSession } from "@/lib/auth/session";
import { acceptOrReject } from "@/lib/domain/submit";
import { parseInquiry } from "@/lib/domain/validation";
import { allowRequest, clientKey } from "@/lib/http/rate-limit";
import { crossOrigin, readBody, resultResponse } from "@/lib/http/form";
import { getRepository } from "@/lib/data/repository";
import { langFromBody, referralFromRequest } from "@/lib/request-context";
import { openGate } from "@/lib/server/gate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const fallback = "/ko/inquiry";
  if (crossOrigin(request)) return resultResponse(request, { status: 403, body: { ok: false, code: "origin" } }, fallback);
  if (!allowRequest(`inquiry:${clientKey(request)}`)) {
    return resultResponse(request, { status: 429, body: { ok: false, code: "rate_limited" } }, fallback);
  }
  const body = await readBody(request);
  const lang = langFromBody(body.lang);
  const parsed = parseInquiry(body, lang);
  if (!parsed.ok) {
    return resultResponse(request, { status: 400, body: { ok: false, code: "invalid", errors: parsed.errors } }, `/${lang}/inquiry`);
  }
  const gate = await openGate();
  const referral = await referralFromRequest();
  const session = await getSession();
  const memberId = session && (session.role === "customer" || session.role === "dealer") ? session.sub : null;
  const result = await acceptOrReject(gate, () => getRepository().createInquiry(parsed.data, referral, memberId));
  return resultResponse(request, result, `/${lang}/inquiry`);
}
