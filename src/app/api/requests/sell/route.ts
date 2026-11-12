import { getRepository } from "@/lib/data/repository";
import { acceptOrReject } from "@/lib/domain/submit";
import { readGuidedPhotos } from "@/lib/domain/guided-photos";
import { parseSell } from "@/lib/domain/validation";
import { MAX_SELL_PHOTOS } from "@/lib/domain/uploads";
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
  if (lang !== "ko") {
    return resultResponse(request, { status: 403, body: { ok: false, code: "forbidden" } }, `/${lang}/sell`);
  }
  const parsed = parseSell(body, lang);
  if (!parsed.ok) return resultResponse(request, { status: 400, body: { ok: false, code: "invalid", errors: parsed.errors } }, `/${lang}/sell`);

  const photos = await readGuidedPhotos(form, lang, MAX_SELL_PHOTOS, { requireRequiredSlots: false });
  if (!photos.ok) {
    return resultResponse(
      request,
      {
        status: 400,
        body: {
          ok: false,
          code: "invalid",
          errors: {
            photos:
              lang === "ko"
                ? "사진은 JPEG/PNG/WebP로 올려 주세요. (각 8MB 이하, 선택)"
                : "Upload photos as JPEG/PNG/WebP (max 8MB each, optional).",
          },
        },
      },
      `/${lang}/sell`,
    );
  }

  const stored = photos.shots.map((shot) => ({
    bytes: shot.bytes,
    contentType: shot.contentType,
    originalName: `${shot.slot}.${shot.contentType === "image/png" ? "png" : shot.contentType === "image/webp" ? "webp" : "jpg"}`,
  }));
  const gate = await openGate();
  const referral = await referralFromRequest();
  const result = await acceptOrReject(gate, () => getRepository().createSell(parsed.data, stored, referral.firstReferralCode));
  return resultResponse(request, result, `/${lang}/sell`);
}
