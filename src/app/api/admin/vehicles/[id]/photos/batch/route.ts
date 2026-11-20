import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { DataAccessError } from "@/lib/data/errors";
import { StoreError } from "@/lib/demo/store";
import { checkImage, MAX_VEHICLE_PHOTOS } from "@/lib/domain/uploads";
import type { PhotoCategory } from "@/lib/domain/types";

export const runtime = "nodejs";

function categoryForIndex(index: number): PhotoCategory {
  if (index === 0) return "front";
  if (index === 1) return "front_side";
  if (index === 2) return "rear";
  return "exterior";
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const form = await request.formData();
  const files = form
    .getAll("files")
    .filter((item): item is File => item instanceof File && item.size > 0);
  if (!files.length) return NextResponse.json({ ok: false, code: "photo_required" }, { status: 400 });
  if (files.length > MAX_VEHICLE_PHOTOS) {
    return NextResponse.json({ ok: false, code: "too_many_photos", max: MAX_VEHICLE_PHOTOS }, { status: 400 });
  }

  const repo = getRepository();
  const uploaded: string[] = [];
  try {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const bytes = Buffer.from(await file.arrayBuffer());
      const checked = checkImage(bytes);
      if (!checked.ok) {
        return NextResponse.json({ ok: false, code: "invalid_image", index }, { status: 400 });
      }
      const photo = await repo.addPhoto(id, {
        bytes,
        contentType: checked.contentType,
        category: categoryForIndex(index),
        altKo: `차량 사진 ${index + 1}`,
        altEn: `Vehicle photo ${index + 1}`,
      });
      // Keep the client arrangement even if the vehicle already had photos.
      await repo.updatePhoto(id, photo.id, {
        sortOrder: index,
        isCover: index === 0,
      });
      uploaded.push(photo.id);
    }
    return NextResponse.json({ ok: true, count: uploaded.length, ids: uploaded });
  } catch (error) {
    if (error instanceof StoreError) {
      return NextResponse.json({ ok: false, code: error.code, uploaded: uploaded.length }, { status: 400 });
    }
    if (error instanceof DataAccessError) {
      return NextResponse.json({ ok: false, code: error.code, uploaded: uploaded.length }, { status: 503 });
    }
    throw error;
  }
}
