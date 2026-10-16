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
    await getRepository().updatePhoto(id, photoId, {
      category: categories.has(category) ? (category as PhotoCategory) : undefined,
      sortOrder: Number(form.get("sortOrder") ?? 0),
      isCover: form.get("isCover") === "1",
      altKo: String(form.get("altKo") ?? ""),
      altEn: String(form.get("altEn") ?? ""),
    });
    back.searchParams.set("saved", "1");
    return NextResponse.redirect(back, 303);
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.redirect(back, 303);
  const bytes = Buffer.from(await file.arrayBuffer());
  const checked = checkImage(bytes);
  if (!checked.ok) return NextResponse.redirect(back, 303);
  const category = String(form.get("category") ?? "exterior");
  await getRepository().addPhoto(id, {
    bytes,
    contentType: checked.contentType,
    category: categories.has(category) ? (category as PhotoCategory) : "exterior",
    altKo: String(form.get("altKo") ?? "차량 사진"),
    altEn: String(form.get("altEn") ?? "Vehicle photo"),
  });
  back.searchParams.set("saved", "uploaded");
  return NextResponse.redirect(back, 303);
}
