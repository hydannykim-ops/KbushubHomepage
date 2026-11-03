import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { checkImage } from "@/lib/domain/uploads";
import type { PhotoCategory } from "@/lib/domain/types";
import { absoluteUrl } from "@/lib/http/request-url";
import { photoCategoryList } from "@/lib/labels";

export const runtime = "nodejs";

const categories = new Set<string>(photoCategoryList);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const back = absoluteUrl(request, `/admin/vehicles/${id}`);
  if (!admin) return NextResponse.redirect(absoluteUrl(request, "/admin/login"), 303);
  const form = await request.formData();
  const photoId = String(form.get("photoId") ?? "");
  if (form.get("delete") === "1" && photoId) {
    await getRepository().deletePhoto(id, photoId);
    back.searchParams.set("saved", "deleted");
    return NextResponse.redirect(back, 303);
  }
  if (photoId && form.get("update") === "1") {
    const category = String(form.get("category") ?? "");
    // Only touch alt text when the form actually includes those fields — list
    // reorder/cover forms omit them and must not wipe existing descriptions.
    const patch: {
      category?: PhotoCategory;
      sortOrder: number;
      isCover: boolean;
      altKo?: string;
      altEn?: string;
    } = {
      category: categories.has(category) ? (category as PhotoCategory) : undefined,
      sortOrder: Number(form.get("sortOrder") ?? 0),
      isCover: form.get("isCover") === "1",
    };
    if (form.has("altKo")) patch.altKo = String(form.get("altKo") ?? "");
    if (form.has("altEn")) patch.altEn = String(form.get("altEn") ?? "");
    try {
      await getRepository().updatePhoto(id, photoId, patch);
    } catch {
      back.searchParams.set("error", "photo_update_failed");
      return NextResponse.redirect(back, 303);
    }
    back.searchParams.set("saved", "1");
    return NextResponse.redirect(back, 303);
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    back.searchParams.set("error", "photo_required");
    return NextResponse.redirect(back, 303);
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const checked = checkImage(bytes);
  if (!checked.ok) {
    back.searchParams.set("error", "invalid_image");
    return NextResponse.redirect(back, 303);
  }
  const category = String(form.get("category") ?? "exterior");
  try {
    await getRepository().addPhoto(id, {
      bytes,
      contentType: checked.contentType,
      category: categories.has(category) ? (category as PhotoCategory) : "exterior",
      altKo: String(form.get("altKo") ?? "차량 사진"),
      altEn: String(form.get("altEn") ?? "Vehicle photo"),
    });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String((error as { code: string }).code) : "photo_upload_failed";
    back.searchParams.set("error", code);
    return NextResponse.redirect(back, 303);
  }
  back.searchParams.set("saved", "uploaded");
  return NextResponse.redirect(back, 303);
}
