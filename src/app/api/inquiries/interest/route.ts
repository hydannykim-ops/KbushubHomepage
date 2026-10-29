import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { inquiryTradeModeForCountry, normalizeCountry } from "@/lib/domain/country";
import { acceptOrReject } from "@/lib/domain/submit";
import type { InquiryInput } from "@/lib/domain/validation";
import { crossOrigin } from "@/lib/http/form";
import { allowRequest, clientKey } from "@/lib/http/rate-limit";
import { langFromBody, referralFromRequest } from "@/lib/request-context";
import { openGate } from "@/lib/server/gate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (crossOrigin(request)) return NextResponse.json({ ok: false, code: "origin" }, { status: 403 });
  if (!allowRequest(`interest:${clientKey(request)}`, 20)) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }
  const member = await requireMember();
  if (!member) return NextResponse.json({ ok: false, code: "login_required" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const lang = langFromBody(body?.lang);
  const stockNo = typeof body?.stockNo === "string" ? body.stockNo.trim() : "";
  if (!stockNo) return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });

  const repo = getRepository();
  const profile = await repo.getMember(member.sub);
  const email = profile?.email || member.email;
  const name = profile?.name || member.name || email;
  const phone = profile?.phone ?? null;
  const country = normalizeCountry(profile?.country) ?? "한국";
  const tradeMode = inquiryTradeModeForCountry(country);

  const existing = await repo.findOpenInquiry(email, stockNo);
  if (existing) return NextResponse.json({ ok: true, id: existing.id, existing: true });

  const vehicle = await repo.getPublicByStockNo(stockNo);
  if (!vehicle) return NextResponse.json({ ok: false, code: "not_found" }, { status: 404 });

  const gate = await openGate();
  const referral = await referralFromRequest();
  const kind = tradeMode === "export" ? "quote" : "purchase";
  const message =
    lang === "ko"
      ? tradeMode === "export"
        ? `수출 문의 · 매물 ${stockNo}`
        : `전화 상담 요청 · 매물 ${stockNo}`
      : tradeMode === "export"
        ? `Export inquiry · stock ${stockNo}`
        : `Phone consultation requested · stock ${stockNo}`;

  const input: InquiryInput = {
    kind,
    tradeMode,
    name,
    email,
    phone,
    messenger: null,
    country,
    stockNo,
    message,
    destinationCountry: tradeMode === "export" ? country : null,
    destinationPort: null,
    destinationPortUndecided: tradeMode === "export",
    shippingMethod: tradeMode === "export" ? "undecided" : null,
    consent: true,
    companyWebsite: "",
    lang,
  };

  const result = await acceptOrReject(gate, () => repo.createInquiry(input, referral));
  if (!result.body.ok) return NextResponse.json(result.body, { status: result.status });
  return NextResponse.json({ ok: true, id: result.body.id ?? null, existing: false, tradeMode });
}
