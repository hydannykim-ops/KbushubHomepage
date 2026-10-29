import { requireMember } from "@/lib/auth/session";
import { acceptOrReject } from "@/lib/domain/submit";
import { parseInquiry } from "@/lib/domain/validation";
import { allowRequest, clientKey } from "@/lib/http/rate-limit";
import { crossOrigin, readBody, resultResponse } from "@/lib/http/form";
import { getRepository } from "@/lib/data/repository";
import { langFromBody, referralFromRequest } from "@/lib/request-context";
import { openGate } from "@/lib/server/gate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readBody(request);
  const lang = langFromBody(body.lang);
  const stockNo = typeof body.stockNo === "string" ? body.stockNo.trim() : "";
  const fallback = stockNo ? `/${lang}/vehicles/${encodeURIComponent(stockNo)}` : `/${lang}/inquiry`;
  if (crossOrigin(request)) return resultResponse(request, { status: 403, body: { ok: false, code: "origin" } }, fallback);
  if (!allowRequest(`inquiry:${clientKey(request)}`)) {
    return resultResponse(request, { status: 429, body: { ok: false, code: "rate_limited" } }, fallback);
  }

  // Vehicle purchase/quote inquiries require a signed-in customer or dealer.
  if (stockNo) {
    const member = await requireMember();
    if (!member) {
      return resultResponse(request, { status: 401, body: { ok: false, code: "login_required" } }, fallback);
    }
    body.name = member.name || body.name;
    body.email = member.email || body.email;
    if (!body.phone) {
      const profile = await getRepository().getMember(member.sub);
      if (profile?.phone) body.phone = profile.phone;
    }
  }

  const parsed = parseInquiry(body, lang);
  if (!parsed.ok) {
    return resultResponse(request, { status: 400, body: { ok: false, code: "invalid", errors: parsed.errors } }, fallback);
  }
  const gate = await openGate();
  const referral = await referralFromRequest();
  const result = await acceptOrReject(gate, () => getRepository().createInquiry(parsed.data, referral));
  const redirectTo = parsed.data.stockNo ? `/${lang}/vehicles/${encodeURIComponent(parsed.data.stockNo)}` : fallback;
  return resultResponse(request, result, redirectTo);
}
