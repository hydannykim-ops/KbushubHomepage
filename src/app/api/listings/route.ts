import { getSession } from "@/lib/auth/session";
import { DataAccessError, sanitizeErrorDetail } from "@/lib/data/errors";
import { getRepository } from "@/lib/data/repository";
import { StoreError } from "@/lib/demo/store";
import { readGuidedPhotos } from "@/lib/domain/guided-photos";
import { parseDealerListing } from "@/lib/domain/validation";
import { crossOrigin, resultResponse } from "@/lib/http/form";
import { allowRequest, clientKey } from "@/lib/http/rate-limit";
import { langFromBody } from "@/lib/request-context";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const fallback = "/ko/sell";
  if (crossOrigin(request)) return resultResponse(request, { status: 403, body: { ok: false, code: "origin" } }, fallback);
  if (!allowRequest(`listing:${clientKey(request)}`, 6)) {
    return resultResponse(request, { status: 429, body: { ok: false, code: "rate_limited" } }, fallback);
  }
  const session = await getSession();
  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    console.error(JSON.stringify({ context: "listing_formdata", message: String(error) }));
    return resultResponse(request, { status: 413, body: { ok: false, code: "payload_too_large" } }, fallback);
  }
  const body: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) if (typeof value === "string") body[key] = value;
  const lang = langFromBody(body.lang);
  const back = `/${lang}/sell`;
  if (!session || (session.role !== "dealer" && session.role !== "customer")) {
    return resultResponse(request, { status: 401, body: { ok: false, code: "login_failed" } }, `/${lang}/account/login`);
  }
  if (session.role !== "dealer") return resultResponse(request, { status: 403, body: { ok: false, code: "dealer_only" } }, back);
  const parsed = parseDealerListing(body, lang);
  if (!parsed.ok) return resultResponse(request, { status: 400, body: { ok: false, code: "invalid", errors: parsed.errors } }, back);

  const photos = await readGuidedPhotos(form, lang);
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
                ? "정면·좌측·우측·후면 사진을 JPEG/PNG/WebP로 올려 주세요. (각 8MB 이하)"
                : "Upload front, left, right, and rear photos as JPEG/PNG/WebP (max 8MB each).",
          },
        },
      },
      back,
    );
  }

  const owner = await getRepository().getMember(session.sub);
  if (!owner || owner.role !== "dealer") return resultResponse(request, { status: 403, body: { ok: false, code: "dealer_only" } }, back);
  try {
    const listing = await getRepository().createDealerListing(owner, parsed.data, photos.shots);
    return resultResponse(request, { status: 201, body: { ok: true, demo: listing.demo, id: listing.id, stockNo: listing.stockNo } }, back);
  } catch (error) {
    if (error instanceof StoreError && error.code === "dealer_only") {
      return resultResponse(request, { status: 403, body: { ok: false, code: "dealer_only" } }, back);
    }
    if (error instanceof DataAccessError) {
      console.error(JSON.stringify({ context: "listing_save", step: error.context, detail: error.detail, code: error.code }));
      return resultResponse(
        request,
        {
          status: error.code === "misconfigured" ? 503 : 500,
          body: {
            ok: false,
            code: error.code === "misconfigured" ? "not_configured" : "save_failed",
            step: error.context ?? "data",
            detail: error.detail ?? error.code,
          },
        },
        back,
      );
    }
    const detail = sanitizeErrorDetail(error);
    console.error(JSON.stringify({ context: "listing_save", detail }));
    return resultResponse(
      request,
      { status: 500, body: { ok: false, code: "save_failed", step: "listing_save", detail: detail || "unknown" } },
      back,
    );
  }
}
