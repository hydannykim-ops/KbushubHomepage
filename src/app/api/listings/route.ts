import { getSession } from "@/lib/auth/session";
import { StoreError } from "@/lib/demo/store";
import { getRepository } from "@/lib/data/repository";
import { checkImage, MAX_VEHICLE_PHOTOS } from "@/lib/domain/uploads";
import { parseDealerListing } from "@/lib/domain/validation";
import { crossOrigin, resultResponse } from "@/lib/http/form";
import { allowRequest, clientKey } from "@/lib/http/rate-limit";
import type { ImageType } from "@/lib/domain/uploads";
import { langFromBody } from "@/lib/request-context";

export const runtime = "nodejs";

async function imageFile(file: FormDataEntryValue | null): Promise<{ bytes: Buffer; contentType: ImageType } | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const bytes = Buffer.from(await file.arrayBuffer());
  const checked = checkImage(bytes);
  if (!checked.ok) return null;
  return { bytes, contentType: checked.contentType };
}

export async function POST(request: Request) {
  const fallback = "/ko/sell";
  if (crossOrigin(request)) return resultResponse(request, { status: 403, body: { ok: false, code: "origin" } }, fallback);
  if (!allowRequest(`listing:${clientKey(request)}`, 6)) {
    return resultResponse(request, { status: 429, body: { ok: false, code: "rate_limited" } }, fallback);
  }
  const session = await getSession();
  const form = await request.formData();
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
  const front = await imageFile(form.get("front"));
  const frontSide = await imageFile(form.get("frontSide"));
  const rear = await imageFile(form.get("rear"));
  if (!front || !frontSide || !rear) {
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
                ? "정면·정측면·후면 사진을 JPEG/PNG/WebP로 올려 주세요. (각 8MB 이하)"
                : "Upload front, front three-quarter, and rear photos as JPEG/PNG/WebP (max 8MB each).",
          },
        },
      },
      back,
    );
  }
  const extraFiles = form.getAll("extras").filter((item): item is File => item instanceof File && item.size > 0);
  if (3 + extraFiles.length > MAX_VEHICLE_PHOTOS) {
    return resultResponse(
      request,
      {
        status: 400,
        body: {
          ok: false,
          code: "invalid",
          errors: {
            photos: lang === "ko" ? "사진은 최대 12장까지입니다." : "You can upload up to 12 photos.",
          },
        },
      },
      back,
    );
  }
  const extras: Array<{ bytes: Buffer; contentType: ImageType }> = [];
  for (const file of extraFiles) {
    const checked = await imageFile(file);
    if (!checked) {
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
                  ? "추가 사진은 JPEG/PNG/WebP만 가능합니다. (각 8MB 이하)"
                  : "Extra photos must be JPEG/PNG/WebP (max 8MB each).",
            },
          },
        },
        back,
      );
    }
    extras.push(checked);
  }
  const owner = await getRepository().getMember(session.sub);
  if (!owner || owner.role !== "dealer") return resultResponse(request, { status: 403, body: { ok: false, code: "dealer_only" } }, back);
  try {
    const listing = await getRepository().createDealerListing(owner, parsed.data, { front: front.bytes, frontSide: frontSide.bytes, rear: rear.bytes, extras }, {
      front: front.contentType,
      frontSide: frontSide.contentType,
      rear: rear.contentType,
    });
    return resultResponse(request, { status: 201, body: { ok: true, demo: listing.demo, id: listing.id, code: "review" } }, back);
  } catch (error) {
    if (error instanceof StoreError && error.code === "dealer_only") {
      return resultResponse(request, { status: 403, body: { ok: false, code: "dealer_only" } }, back);
    }
    return resultResponse(request, { status: 500, body: { ok: false, code: "save_failed" } }, back);
  }
}
